package com.mercure.controller;

import com.mercure.dto.GroupDTO;
import com.mercure.dto.MessageDTO;
import com.mercure.dto.NotificationDTO;
import com.mercure.dto.UserDTO;
import com.mercure.entity.MessageEntity;
import com.mercure.service.GroupService;
import com.mercure.service.MessageService;
import com.mercure.service.UserService;
import com.mercure.utils.ComparatorListGroupDTO;
import com.mercure.utils.JwtUtil;
import com.mercure.utils.MessageTypeEnum;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@CrossOrigin
public class WsController {

    private Logger log = LoggerFactory.getLogger(WsController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private GroupService groupService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public String testRoute(HttpServletRequest request) {
        String requestTokenHeader = request.getHeader("authorization");
        if (StringUtils.isEmpty(requestTokenHeader)) {
            return null;
        }
        return jwtUtil.getUserNameFromJwtToken(requestTokenHeader.substring(7));
    }

    /**
     * Used this to retrieve user information (without password)
     * and all groups attached to the user
     *
     * @param token the String request from client
     * @return {@link UserDTO}
     */
    @MessageMapping("/message")
    @SendToUser("/queue/reply")
    public List<GroupDTO> initUserProfile(String token, @Header("simpSessionId") String sessionId) {
        String username = userService.findUsernameWithWsToken(token);
        if (StringUtils.isEmpty(username)) {
            log.warn("Username not found");
            return null;
        }
        UserDTO user = userService.getUserInformation(username);
        List<GroupDTO> toReturn = user.getGroupList();
        toReturn.sort(new ComparatorListGroupDTO());
        return toReturn;
    }


    /**
     * Receive message from user and dispatch to all users subscribed to conversation
     *
     * @param userId     the int userId for mapping message to a user
     * @param groupUrl   the string groupUrl for mapping message to a group
     * @param messageDTO the payload received
     * @return a messageDTO with all informations
     */
    @MessageMapping("/message/text/{userId}/group/{groupUrl}")
    @SendTo("/topic/{groupUrl}")
    public MessageDTO wsMessageMapping(@DestinationVariable int userId, @DestinationVariable String groupUrl, MessageDTO messageDTO) {
        int groupId = groupService.findGroupByUrl(groupUrl);
        MessageEntity messageEntity = new MessageEntity(userId, groupId, MessageTypeEnum.TEXT.toString(), messageDTO.getMessage());
        MessageEntity msg = messageService.save(messageEntity);
        NotificationDTO notificationDTO = messageService.createNotificationDTO(msg);
        List<Integer> toSend = messageService.createNotificationList(userId, groupUrl);
        toSend.forEach(toUserId -> messagingTemplate.convertAndSend("/topic/notification/" + toUserId, notificationDTO));
        return messageService.createMessageDTO(msg.getId(), msg.getType(), msg.getUser_id(), msg.getCreatedAt().toString(), msg.getGroup_id(), msg.getMessage());
    }

    @MessageMapping("/message/call/{userId}/group/{groupUrl}")
    @SendTo("/topic/call/reply/{groupUrl}")
    public String wsCallMessageMapping(@DestinationVariable int userId, String req) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(req);
        log.info("Receiving RTC data, sending back to user ...");
        JSONObject json = new JSONObject();
        try {
            json.put("userIn", userId);
            json.put("rtc", jsonObject);
        } catch (Exception e) {
            log.info(String.valueOf(json));
            log.info("Error during JSON creation : {}", e.getMessage());
        }
        return req;
    }

//    @SubscribeMapping("/message/call/{userId}/group/{groupUrl}")
//    public JSONObject onCallMessageSubscribeCallback(@DestinationVariable int userId) throws ParseException {
//        log.info("User id {} is subscribed to channel",userId);
//        JSONObject json = new JSONObject();
//        try {
//            json.put("userIn", userId);
//            json.put("rtc", jsonObject);
//        } catch (Exception e) {
//            log.info("Error during JSON creation : {}", e.getMessage());
//        }
//        return json;
//    }

    @MessageMapping("/groups/create/single")
    @SendToUser("/queue/reply")
    public MessageDTO wsCreateConversation(String req) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(req);
        Long id1 = (Long) jsonObject.get("id1");
        Long id2 = (Long) jsonObject.get("id2");
        groupService.createConversation(id1.intValue(), id2.intValue());
        return null;
    }


    /**
     * Return history of group discussion
     *
     * @param url The group url to map
     * @return List of message
     */
    @SubscribeMapping("/groups/get/{url}")
    public List<MessageDTO> findOne(@DestinationVariable String url) {
//        log.info("Subscription to topic {}", url);
        if (url != null) {
            List<MessageDTO> messageDTOS = new ArrayList<>();
            int groupId = groupService.findGroupByUrl(url);
            messageService.findByGroupId(groupId).forEach(msg -> {
                messageDTOS.add(messageService.createMessageDTO(msg.getId(), msg.getType(), msg.getUser_id(), msg.getCreatedAt().toString(), msg.getGroup_id(), msg.getMessage()));
            });
            return messageDTOS;
        }
        return null;
    }
}
