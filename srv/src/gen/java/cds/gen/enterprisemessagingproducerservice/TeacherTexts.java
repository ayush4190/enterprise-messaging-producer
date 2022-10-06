package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.CdsData;
import com.sap.cds.Struct;
import com.sap.cds.ql.CdsName;
import java.lang.String;

@CdsName("EnterpriseMessagingProducerService.teacher.texts")
public interface TeacherTexts extends CdsData {
  String LOCALE = "locale";

  String ID = "ID";

  String STUDENT_ID = "studentId";

  String FIRST_NAME = "firstName";

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

  TeacherTexts_ ref();

  static TeacherTexts create() {
    return Struct.create(TeacherTexts.class);
  }
}
