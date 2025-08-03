package com.drmp.util;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * IP工具类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
public class IpUtils {

    private static final String UNKNOWN = "unknown";
    private static final String LOCALHOST_IPV4 = "127.0.0.1";
    private static final String LOCALHOST_IPV6 = "0:0:0:0:0:0:0:1";

    /**
     * 获取客户端真实IP地址
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return UNKNOWN;
        }

        String ip = null;
        try {
            // X-Forwarded-For：Squid 服务代理
            ip = request.getHeader("X-Forwarded-For");
            if (isEmptyIp(ip)) {
                // Proxy-Client-IP：apache 服务代理
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (isEmptyIp(ip)) {
                // WL-Proxy-Client-IP：weblogic 服务代理
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (isEmptyIp(ip)) {
                // HTTP_CLIENT_IP：有些代理服务器
                ip = request.getHeader("HTTP_CLIENT_IP");
            }
            if (isEmptyIp(ip)) {
                // HTTP_X_FORWARDED_FOR：有些代理服务器
                ip = request.getHeader("HTTP_X_FORWARDED_FOR");
            }
            if (isEmptyIp(ip)) {
                // X-Real-IP：nginx服务代理
                ip = request.getHeader("X-Real-IP");
            }
            if (isEmptyIp(ip)) {
                // 兜底取IP
                ip = request.getRemoteAddr();
                if (LOCALHOST_IPV4.equals(ip) || LOCALHOST_IPV6.equals(ip)) {
                    // 根据网卡取本机配置的IP
                    ip = getLocalAddr();
                }
            }
        } catch (Exception e) {
            log.error("获取IP地址失败", e);
        }

        // 使用代理的情况下，第一个IP为客户端真实IP，多个IP按照','分割
        if (ip != null && ip.indexOf(",") != -1) {
            ip = ip.split(",")[0];
        }

        return ip;
    }

    /**
     * 检查IP是否为空
     */
    private static boolean isEmptyIp(String ip) {
        return ip == null || ip.length() == 0 || UNKNOWN.equalsIgnoreCase(ip);
    }

    /**
     * 获取本机IP地址
     */
    public static String getLocalAddr() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.error("获取本机IP失败", e);
        }
        return LOCALHOST_IPV4;
    }

    /**
     * 获取主机名
     */
    public static String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            log.error("获取主机名失败", e);
        }
        return UNKNOWN;
    }

    /**
     * 判断IP是否为内网IP
     */
    public static boolean isInternalIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }

        try {
            String[] parts = ip.split("\\.");
            if (parts.length != 4) {
                return false;
            }

            int firstPart = Integer.parseInt(parts[0]);
            int secondPart = Integer.parseInt(parts[1]);

            // 10.0.0.0 - 10.255.255.255
            if (firstPart == 10) {
                return true;
            }

            // 172.16.0.0 - 172.31.255.255
            if (firstPart == 172 && secondPart >= 16 && secondPart <= 31) {
                return true;
            }

            // 192.168.0.0 - 192.168.255.255
            if (firstPart == 192 && secondPart == 168) {
                return true;
            }

            // 127.0.0.0 - 127.255.255.255
            if (firstPart == 127) {
                return true;
            }

            return false;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * IP地址转换为长整型
     */
    public static long ipToLong(String ip) {
        if (ip == null || ip.isEmpty()) {
            return 0;
        }

        try {
            String[] parts = ip.split("\\.");
            if (parts.length != 4) {
                return 0;
            }

            long result = 0;
            for (int i = 0; i < 4; i++) {
                result |= (Long.parseLong(parts[i]) << (24 - 8 * i));
            }
            return result;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /**
     * 长整型转换为IP地址
     */
    public static String longToIp(long ip) {
        return ((ip >> 24) & 0xFF) + "." +
               ((ip >> 16) & 0xFF) + "." +
               ((ip >> 8) & 0xFF) + "." +
               (ip & 0xFF);
    }
}