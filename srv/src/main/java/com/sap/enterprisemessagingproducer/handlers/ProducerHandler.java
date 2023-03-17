package com.sap.enterprisemessagingproducer.handlers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.shaded.json.JSONArray;
import com.nimbusds.jose.shaded.json.JSONObject;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.messaging.MessagingService;

import cds.gen.enterprisemessagingproducerservice.Students;
import cds.gen.sap.capire.enterprisemessagingproducer.Student;

@Component
@ServiceName("EnterpriseMessagingProducerService")
public class ProducerHandler implements EventHandler {

	private static final Logger logger = LoggerFactory.getLogger(ProducerHandler.class);

	@Autowired
	@Qualifier("messaging")
	MessagingService messagingService;

	@On(event = CdsService.EVENT_CREATE, entity = "EnterpriseMessagingProducerService.Students")
	public void produceStudentEnrollementEvent(List<Students> studentlists) throws Exception {

		JSONObject payload = new JSONObject();

		JSONArray jsonArray = new JSONArray();

		for (Students students : studentlists) {
			JSONObject jsonObject = new JSONObject();

			jsonObject.put(Student.FIRST_NAME, students.getFirstName());
			jsonObject.put(Student.LAST_NAME, students.getLastName());
			jsonObject.put(Student.CURRENT_CLASS, students.getCurrentClass());

			jsonArray.add(jsonObject);

		}

		payload.put("data", jsonArray);

		logger.info("Data Emitted to the topic  {}", payload.toJSONString());
		messagingService.emit("StudentEnrolled", payload);

	}

}
