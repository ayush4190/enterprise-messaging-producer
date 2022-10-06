package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.ql.CdsName;
import java.lang.Class;
import java.lang.String;

@CdsName("sap.capire.enterpriseMessagingProducer")
public interface EnterpriseMessagingProducer_ {
  String CDS_NAME = "sap.capire.enterpriseMessagingProducer";

  Class<Teacher_> TEACHER = Teacher_.class;

  Class<Student_> STUDENT = Student_.class;

  Class<StudentTexts_> STUDENT_TEXTS = StudentTexts_.class;

  Class<TeacherTexts_> TEACHER_TEXTS = TeacherTexts_.class;
}
