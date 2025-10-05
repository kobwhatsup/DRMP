#!/bin/bash

# DRMP登录功能测试脚本
# 快速验证核心登录功能

API_BASE="http://localhost:8080/api"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  DRMP 登录功能自动化测试${NC}"
echo -e "${BOLD}========================================${NC}\n"

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5

    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}[测试 $TOTAL]${NC} $test_name"

    if [ -n "$token" ]; then
        response=$(curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi

    echo "  响应: $response"

    # 检查是否包含成功标志
    if echo "$response" | grep -q '"code":200'; then
        echo -e "  ${GREEN}✅ 通过${NC}\n"
        PASSED=$((PASSED + 1))
        echo "$response"
    else
        echo -e "  ${RED}❌ 失败${NC}\n"
        FAILED=$((FAILED + 1))
        echo ""
    fi
}

# ============================================
# 第一部分：基础健康检查
# ============================================
echo -e "${BOLD}1. 健康检查${NC}\n"

echo "检查后端服务..."
health_check=$(curl -s "$API_BASE/../actuator/health" 2>/dev/null)
if echo "$health_check" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}✅ 后端服务正常${NC}\n"
else
    echo -e "${RED}❌ 后端服务异常或未启动${NC}"
    echo "请先启动后端服务: ./start-backend.sh"
    exit 1
fi

echo "检查Redis连接..."
redis_check=$(redis-cli ping 2>/dev/null)
if [ "$redis_check" = "PONG" ]; then
    echo -e "${GREEN}✅ Redis连接正常${NC}\n"
else
    echo -e "${YELLOW}⚠️  Redis未连接（会使用内存备份）${NC}\n"
fi

# ============================================
# 第二部分：登录功能测试
# ============================================
echo -e "${BOLD}2. 登录功能测试${NC}\n"

# 测试1: 正常登录
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin@123456","rememberMe":false}' \
    "$API_BASE/v1/auth/login")

echo -e "${YELLOW}[测试 1]${NC} 正常登录（不记住我）"
echo "  响应: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"code":200'; then
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    echo -e "  ${GREEN}✅ 登录成功${NC}"
    echo "  Access Token: ${ACCESS_TOKEN:0:50}..."
    echo "  Refresh Token: ${REFRESH_TOKEN:0:50}...\n"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${RED}❌ 登录失败${NC}\n"
    FAILED=$((FAILED + 1))
    echo "详细响应: $LOGIN_RESPONSE"
    exit 1
fi

TOTAL=$((TOTAL + 1))

# 测试2: 获取当前用户信息
test_api "获取当前用户信息" "GET" "/v1/auth/current-user" "" "$ACCESS_TOKEN"

# 测试3: 获取会话列表
test_api "获取活跃会话列表" "GET" "/v1/auth/sessions" "" "$ACCESS_TOKEN"

# 测试4: 记住我登录
REMEMBER_LOGIN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin@123456","rememberMe":true}' \
    "$API_BASE/v1/auth/login")

TOTAL=$((TOTAL + 1))
echo -e "${YELLOW}[测试 $TOTAL]${NC} 记住我登录（30天）"
echo "  响应: $REMEMBER_LOGIN"

if echo "$REMEMBER_LOGIN" | grep -q '"code":200'; then
    REMEMBER_REFRESH_TOKEN=$(echo "$REMEMBER_LOGIN" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "  ${GREEN}✅ 记住我登录成功${NC}"
    echo "  Refresh Token: ${REMEMBER_REFRESH_TOKEN:0:50}...\n"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${RED}❌ 记住我登录失败${NC}\n"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 第三部分：Token刷新测试
# ============================================
echo -e "${BOLD}3. Token刷新测试${NC}\n"

# 测试5: 刷新Token
test_api "刷新Access Token" "POST" "/v1/auth/refresh" "{\"refreshToken\":\"$REFRESH_TOKEN\"}" ""

# ============================================
# 第四部分：登出测试
# ============================================
echo -e "${BOLD}4. 登出测试${NC}\n"

# 测试6: 正常登出
test_api "用户登出" "POST" "/v1/auth/logout" "" "$ACCESS_TOKEN"

# 测试7: 使用已登出的Token（应该失败）
TOTAL=$((TOTAL + 1))
echo -e "${YELLOW}[测试 $TOTAL]${NC} 使用已登出的Token（预期失败）"

BLACKLIST_TEST=$(curl -s -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "$API_BASE/v1/auth/current-user")

echo "  响应: $BLACKLIST_TEST"

if echo "$BLACKLIST_TEST" | grep -q '"code":401\|Unauthorized'; then
    echo -e "  ${GREEN}✅ Token黑名单机制正常${NC}\n"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${RED}❌ Token黑名单机制异常${NC}\n"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 第五部分：Redis验证（可选）
# ============================================
if [ "$redis_check" = "PONG" ]; then
    echo -e "${BOLD}5. Redis数据验证${NC}\n"

    echo "会话数量:"
    redis-cli KEYS "session:*" | wc -l

    echo -e "\n黑名单Token数量:"
    redis-cli KEYS "blacklist:*" | wc -l

    echo -e "\n用户会话索引:"
    redis-cli KEYS "user:sessions:*"

    echo ""
fi

# ============================================
# 测试报告
# ============================================
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  测试报告${NC}"
echo -e "${BOLD}========================================${NC}\n"

echo "总计测试: $TOTAL"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "\n${RED}❌ 部分测试失败，请检查日志${NC}"
    exit 1
fi
