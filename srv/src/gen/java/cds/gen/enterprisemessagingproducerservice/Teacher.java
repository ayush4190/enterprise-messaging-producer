package cds.gen.enterprisemessagingproducerservice;

import com.sap.cds.CdsData;
import com.sap.cds.Struct;
import com.sap.cds.ql.CdsName;
import java.lang.String;
import java.util.List;
import java.util.Map;

@CdsName("EnterpriseMessagingProducerService.teacher")
public interface Teacher extends CdsData {
  String ID = "ID";

  String STUDENT_ID = "studentId";

  String FIRST_NAME = "firstName";

  String STUDENT = "student";

  String TEXTS = "texts";

  String LOCALIZED = "localized";

  @CdsName(ID)
  String getId();

  @CdsName(ID)
  void setId(String id);

  String getStudentId();

  void setStudentId(String studentId);

  String getFirstName();

  void setFirstName(String firstName);

  Students getStudent();

  void setStudent(Map<String, ?> student);

  List<TeacherTexts> getTexts();

  void setTexts(List<? extends Map<String, ?>> texts);

  TeacherTexts getLocalized();

  void setLocalized(Map<String, ?> localized);

  Teacher_ ref();

  static Teacher create() {
    return Struct.create(Teacher.class);
  }
}
