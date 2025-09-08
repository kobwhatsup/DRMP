#!/bin/bash

# DRMP平台启动脚本
# 用于快速启动开发环境

set -e

echo "🚀 启动DRMP全国分散诉调平台..."

# 检查系统环境
check_requirements() {
    echo "📋 检查系统环境..."
    
    # 检查Java版本
    if ! command -v java &> /dev/null; then
        echo "❌ Java未安装，请安装JDK 11或更高版本"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
    if [ "$JAVA_VERSION" -lt 11 ]; then
        echo "❌ Java版本过低，需要JDK 11或更高版本，当前版本：$JAVA_VERSION"
        exit 1
    fi
    echo "✅ Java版本检查通过：$JAVA_VERSION"
    
    # 检查Node.js版本
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js未安装，请安装Node.js 16或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ Node.js版本过低，需要16或更高版本，当前版本：v$NODE_VERSION"
        exit 1
    fi
    echo "✅ Node.js版本检查通过：v$NODE_VERSION"
    
    # 检查MySQL连接
    if ! command -v mysql &> /dev/null; then
        echo "⚠️ MySQL客户端未找到，请确保MySQL服务正在运行"
    else
        echo "✅ MySQL客户端已安装"
    fi
    
    # 检查Redis连接
    if ! command -v redis-cli &> /dev/null; then
        echo "⚠️ Redis客户端未找到，请确保Redis服务正在运行"
    else
        echo "✅ Redis客户端已安装"
    fi
}

# 初始化数据库
init_database() {
    echo "🗄️ 初始化数据库..."
    
    # 检查数据库是否存在
    DB_EXISTS=$(mysql -u root -proot123456 -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='drmp';" 2>/dev/null | wc -l)
    
    if [ "$DB_EXISTS" -eq 1 ]; then
        echo "⚠️ 数据库drmp已存在"
        read -p "是否要重新创建数据库？(y/N): " recreate_db
        if [[ $recreate_db =~ ^[Yy]$ ]]; then
            echo "🔄 删除现有数据库..."
            mysql -u root -proot123456 -e "DROP DATABASE IF EXISTS drmp;"
        else
            echo "📂 使用现有数据库"
            return
        fi
    fi
    
    echo "🏗️ 创建数据库drmp..."
    mysql -u root -proot123456 -e "CREATE DATABASE IF NOT EXISTS drmp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "✅ 数据库创建完成"
}

# 启动后端服务
start_backend() {
    echo "🖥️ 启动后端服务..."
    cd backend
    
    # 检查依赖
    if [ ! -d "target" ]; then
        echo "📦 首次运行，编译项目..."
        mvn clean compile -DskipTests
    fi
    
    # 启动后端服务
    echo "🚀 启动Spring Boot应用..."
    mvn spring-boot:run &
    BACKEND_PID=$!
    
    # 等待后端服务启动
    echo "⏳ 等待后端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/actuator/health > /dev/null 2>&1; then
            echo "✅ 后端服务启动成功"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo "❌ 后端服务启动失败"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        
        echo "⏳ 等待后端服务启动... ($i/30)"
        sleep 2
    done
    
    cd ..
}

# 启动前端服务
start_frontend() {
    echo "🌐 启动前端服务..."
    cd frontend
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    
    # 启动前端服务
    echo "🚀 启动React开发服务器..."
    npm run dev &
    FRONTEND_PID=$!
    
    # 等待前端服务启动
    echo "⏳ 等待前端服务启动..."
    for i in {1..20}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ 前端服务启动成功"
            break
        fi
        
        if [ $i -eq 20 ]; then
            echo "❌ 前端服务启动失败"
            kill $FRONTEND_PID 2>/dev/null || true
            exit 1
        fi
        
        echo "⏳ 等待前端服务启动... ($i/20)"
        sleep 2
    done
    
    cd ..
}

# 显示启动信息
show_startup_info() {
    echo ""
    echo "🎉 DRMP平台启动成功！"
    echo ""
    echo "📊 服务地址："
    echo "  🌐 前端应用: http://localhost:3000"
    echo "  🖥️ 后端API: http://localhost:8080/api"
    echo "  📚 API文档: http://localhost:8080/api/swagger-ui.html"
    echo "  📊 监控面板: http://localhost:8080/api/actuator"
    echo ""
    echo "👤 默认管理员账号："
    echo "  用户名: admin"
    echo "  密码: admin123456"
    echo ""
    echo "📝 操作提示："
    echo "  - 按 Ctrl+C 停止所有服务"
    echo "  - 查看日志: tail -f logs/drmp.log"
    echo "  - 重启服务: ./scripts/restart-drmp.sh"
    echo ""
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "✅ 后端服务已停止"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "✅ 前端服务已停止"
    fi
    
    echo "👋 再见！"
    exit 0
}

# 注册信号处理
trap cleanup INT TERM

# 主执行流程
main() {
    # 切换到项目根目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_ROOT"
    
    # 执行启动步骤
    check_requirements
    init_database
    start_backend
    start_frontend
    show_startup_info
    
    # 等待用户中断
    echo "💤 服务运行中，按 Ctrl+C 停止..."
    while true; do
        sleep 1
    done
}

# 检查是否以脚本方式执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi