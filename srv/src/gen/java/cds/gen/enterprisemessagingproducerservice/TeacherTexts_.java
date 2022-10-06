package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import java.lang.String;

@CdsName("EnterpriseMessagingProducerService.teacher.texts")
public interface TeacherTexts_ extends StructuredType<TeacherTexts_> {
  String CDS_NAME = "EnterpriseMessagingProducerService.teacher.texts";

  ElementRef<String> locale();

  ElementRef<String> ID();

  ElementRef<String> studentId();

  ElementRef<String> firstName();
}
