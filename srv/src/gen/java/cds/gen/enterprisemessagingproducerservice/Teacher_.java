package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import com.sap.cds.ql.cqn.CqnPredicate;
import java.lang.String;
import java.util.function.Function;

@CdsName("EnterpriseMessagingProducerService.teacher")
public interface Teacher_ extends StructuredType<Teacher_> {
  String CDS_NAME = "EnterpriseMessagingProducerService.teacher";

  ElementRef<String> ID();

  ElementRef<String> studentId();

  ElementRef<String> firstName();

  Students_ student();

  Students_ student(Function<Students_, CqnPredicate> filter);

  TeacherTexts_ texts();

  TeacherTexts_ texts(Function<TeacherTexts_, CqnPredicate> filter);

  TeacherTexts_ localized();

  TeacherTexts_ localized(Function<TeacherTexts_, CqnPredicate> filter);
}
