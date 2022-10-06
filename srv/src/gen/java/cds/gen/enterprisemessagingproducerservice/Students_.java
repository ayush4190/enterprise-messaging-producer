package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import com.sap.cds.ql.cqn.CqnPredicate;
import java.lang.String;
import java.time.Instant;
import java.time.LocalDate;
import java.util.function.Function;

@CdsName("EnterpriseMessagingProducerService.Students")
public interface Students_ extends StructuredType<Students_> {
  String CDS_NAME = "EnterpriseMessagingProducerService.Students";

  ElementRef<String> ID();

  ElementRef<Instant> createdAt();

  ElementRef<String> createdBy();

  ElementRef<Instant> modifiedAt();

  ElementRef<String> modifiedBy();

  ElementRef<String> studentId();

  ElementRef<String> firstName();

  ElementRef<String> lastName();

  ElementRef<LocalDate> dateOfBirth();

  ElementRef<String> placeOfBirth();

  ElementRef<String> currentClass();

  Teacher_ teacher();

  Teacher_ teacher(Function<Teacher_, CqnPredicate> filter);

  StudentsTexts_ texts();

  StudentsTexts_ texts(Function<StudentsTexts_, CqnPredicate> filter);

  StudentsTexts_ localized();

  StudentsTexts_ localized(Function<StudentsTexts_, CqnPredicate> filter);
}
