package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("IpUtils 测试")
class IpUtilsTest {

    @Test
    @DisplayName("getClientIp - 应从X-Forwarded-For获取IP")
    void getClientIp_ShouldGetFromXForwardedFor() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100");
        
        String ip = IpUtils.getClientIp(request);
        assertEquals("192.168.1.100", ip);
    }

    @Test
    @DisplayName("getClientIp - 应从RemoteAddr获取IP")
    void getClientIp_ShouldGetFromRemoteAddr() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
        
        String ip = IpUtils.getClientIp(request);
        assertEquals("192.168.1.100", ip);
    }

    @Test
    @DisplayName("getClientIp - null request应返回unknown")
    void getClientIp_ShouldReturnUnknownForNullRequest() {
        String ip = IpUtils.getClientIp(null);
        assertEquals("unknown", ip);
    }

    @Test
    @DisplayName("getClientIp - 多个IP应取第一个")
    void getClientIp_ShouldGetFirstIpFromMultiple() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100,10.0.0.1");
        
        String ip = IpUtils.getClientIp(request);
        assertEquals("192.168.1.100", ip);
    }

    @Test
    @DisplayName("isInternalIp - 应正确识别内网IP")
    void isInternalIp_ShouldIdentifyInternalIps() {
        assertTrue(IpUtils.isInternalIp("10.0.0.1"));
        assertTrue(IpUtils.isInternalIp("172.16.0.1"));
        assertTrue(IpUtils.isInternalIp("172.31.255.255"));
        assertTrue(IpUtils.isInternalIp("192.168.1.1"));
        assertTrue(IpUtils.isInternalIp("127.0.0.1"));
        
        assertFalse(IpUtils.isInternalIp("8.8.8.8"));
        assertFalse(IpUtils.isInternalIp("114.114.114.114"));
    }

    @Test
    @DisplayName("isInternalIp - 应拒绝无效IP格式")
    void isInternalIp_ShouldRejectInvalidFormat() {
        assertFalse(IpUtils.isInternalIp(null));
        assertFalse(IpUtils.isInternalIp(""));
        assertFalse(IpUtils.isInternalIp("invalid"));
        assertFalse(IpUtils.isInternalIp("192.168.1"));
    }

    @Test
    @DisplayName("ipToLong - 应正确转换IP为长整型")
    void ipToLong_ShouldConvertIpToLong() {
        long result = IpUtils.ipToLong("192.168.1.1");
        assertTrue(result > 0);
        
        assertEquals(0, IpUtils.ipToLong(null));
        assertEquals(0, IpUtils.ipToLong(""));
        assertEquals(0, IpUtils.ipToLong("invalid"));
    }

    @Test
    @DisplayName("longToIp - 应正确转换长整型为IP")
    void longToIp_ShouldConvertLongToIp() {
        long ipLong = IpUtils.ipToLong("192.168.1.1");
        String ip = IpUtils.longToIp(ipLong);
        assertEquals("192.168.1.1", ip);
    }

    @Test
    @DisplayName("getLocalAddr - 应返回本机IP")
    void getLocalAddr_ShouldReturnLocalIp() {
        String ip = IpUtils.getLocalAddr();
        assertNotNull(ip);
        assertFalse(ip.isEmpty());
    }

    @Test
    @DisplayName("getHostName - 应返回主机名")
    void getHostName_ShouldReturnHostName() {
        String hostName = IpUtils.getHostName();
        assertNotNull(hostName);
        assertFalse(hostName.isEmpty());
    }
}
