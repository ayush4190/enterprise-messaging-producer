package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import com.sap.cds.ql.cqn.CqnPredicate;
import java.lang.String;
import java.util.function.Function;

@CdsName("sap.capire.enterpriseMessagingProducer.teacher")
public interface Teacher_ extends StructuredType<Teacher_> {
  String CDS_NAME = "sap.capire.enterpriseMessagingProducer.teacher";

  ElementRef<String> ID();

  ElementRef<String> studentId();

  ElementRef<String> firstName();

  Student_ student();

  Student_ student(Function<Student_, CqnPredicate> filter);

  TeacherTexts_ texts();

  TeacherTexts_ texts(Function<TeacherTexts_, CqnPredicate> filter);

  TeacherTexts_ localized();

  TeacherTexts_ localized(Function<TeacherTexts_, CqnPredicate> filter);
}
