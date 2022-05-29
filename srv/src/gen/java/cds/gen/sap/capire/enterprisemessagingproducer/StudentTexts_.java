package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import java.lang.String;

@CdsName("sap.capire.enterpriseMessagingProducer.student.texts")
public interface StudentTexts_ extends StructuredType<StudentTexts_> {
  String CDS_NAME = "sap.capire.enterpriseMessagingProducer.student.texts";

  ElementRef<String> locale();

  ElementRef<String> ID();

  ElementRef<String> firstName();

  ElementRef<String> lastName();
}
