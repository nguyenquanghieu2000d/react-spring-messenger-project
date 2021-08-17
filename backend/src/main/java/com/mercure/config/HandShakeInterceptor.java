package com.mercure.config;

import com.mercure.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.SimpAttributesContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
public class HandShakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private UserService userService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String jwtToken = request.getURI().getQuery().substring(6);
        if (StringUtils.isEmpty(jwtToken)) {
            return false;
        }
        String name = userService.findUsernameWithWsToken(jwtToken);
        return !StringUtils.isEmpty(name);
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
    }

}
