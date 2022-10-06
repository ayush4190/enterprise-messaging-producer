package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import java.lang.String;

@CdsName("sap.capire.enterpriseMessagingProducer.teacher.texts")
public interface TeacherTexts_ extends StructuredType<TeacherTexts_> {
  String CDS_NAME = "sap.capire.enterpriseMessagingProducer.teacher.texts";

  ElementRef<String> locale();

  ElementRef<String> ID();

  ElementRef<String> studentId();

  ElementRef<String> firstName();
}
