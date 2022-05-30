package com.sap.enterprisemessagingproducer.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.messaging.TopicMessageEventContext;

@Component
public class ConsumerHandler implements EventHandler{
	

	private static final Logger logger = LoggerFactory.getLogger(ProducerHandler.class);

	@On(service = "messaging", event = "com/eventmesh/blog/StudentEnrolled")
	public void listen(TopicMessageEventContext context) {
		
		logger.info("---------------------------Reading Payload Emitted by the Event----------------------------------------------------");
		
		logger.info("reading event id{}",context.getMessageId());
		logger.info("reading event data{}", context.getData());
	}

}
