package com.sap.enterprisemessagingproducer.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.messaging.TopicMessageEventContext;

@Component
public class ConsumerHandler implements EventHandler{
	

	private static final Logger logger = LoggerFactory.getLogger(ConsumerHandler.class);

	@On(service = "messaging", event ={ "sap/s4/beh/purchaseorder/v1/PurchaseOrder/Changed/v1", "sap/s4/beh/purchaseorder/v1/PurchaseOrder/Created/v1",
			"sap/eee/iwxbe/testproducer/v1/Event/Test"})
	public void listen(TopicMessageEventContext context) {
		
		logger.info("---------------------------Reading Payload Emitted by the Event in Same CAP based Microservice----------------------------------------------------");
		
        logger.info("checking if the message if read from SAP Event Mesh {}",context.getIsInbound().toString());
		logger.info("reading event id{}",context.getMessageId());
		logger.info("reading event data  {}", context.getData());
	}

}
