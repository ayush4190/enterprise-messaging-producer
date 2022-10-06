package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.CdsData;
import com.sap.cds.Struct;
import com.sap.cds.ql.CdsName;
import java.lang.String;

@CdsName("sap.capire.enterpriseMessagingProducer.student.texts")
public interface StudentTexts extends CdsData {
  String LOCALE = "locale";

  String ID = "ID";

  String STUDENT_ID = "studentId";

  String FIRST_NAME = "firstName";

  String LAST_NAME = "lastName";

  String getLocale();

  void setLocale(String locale);

  @CdsName(ID)
  String getId();

  @CdsName(ID)
  void setId(String id);

  String getStudentId();

  void setStudentId(String studentId);

  String getFirstName();

  void setFirstName(String firstName);

  String getLastName();

  void setLastName(String lastName);

  StudentTexts_ ref();

  static StudentTexts create() {
    return Struct.create(StudentTexts.class);
  }
}
