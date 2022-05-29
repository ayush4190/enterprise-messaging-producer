package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import java.lang.String;

@CdsName("EnterpriseMessagingProducerService.Students.texts")
public interface StudentsTexts_ extends StructuredType<StudentsTexts_> {
  String CDS_NAME = "EnterpriseMessagingProducerService.Students.texts";

  ElementRef<String> locale();

  ElementRef<String> ID();

  ElementRef<String> firstName();

  ElementRef<String> lastName();
}
