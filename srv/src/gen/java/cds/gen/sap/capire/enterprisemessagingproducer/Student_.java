package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.ql.CdsName;
import com.sap.cds.ql.ElementRef;
import com.sap.cds.ql.StructuredType;
import com.sap.cds.ql.cqn.CqnPredicate;
import java.lang.String;
import java.time.Instant;
import java.time.LocalDate;
import java.util.function.Function;

@CdsName("sap.capire.enterpriseMessagingProducer.student")
public interface Student_ extends StructuredType<Student_> {
  String CDS_NAME = "sap.capire.enterpriseMessagingProducer.student";

  ElementRef<String> ID();

  ElementRef<Instant> createdAt();

  ElementRef<String> createdBy();

  ElementRef<Instant> modifiedAt();

  ElementRef<String> modifiedBy();

  ElementRef<String> firstName();

  ElementRef<String> lastName();

  ElementRef<LocalDate> dateOfBirth();

  ElementRef<String> placeOfBirth();

  ElementRef<String> currentClass();

  StudentTexts_ texts();

  StudentTexts_ texts(Function<StudentTexts_, CqnPredicate> filter);

  StudentTexts_ localized();

  StudentTexts_ localized(Function<StudentTexts_, CqnPredicate> filter);
}
