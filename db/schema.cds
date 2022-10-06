namespace sap.capire.enterpriseMessagingProducer;

using {
    cuid,
    managed
} from '@sap/cds/common';


entity student : cuid, managed {

    key studentId    : String(10);
        firstName    : localized String(100);
        lastName     : localized String(100);
        dateOfBirth  : Date;
        placeOfBirth : String(100);
        currentClass : String(10);
        teacher      : Composition of many teacher
                           on teacher.studentId = studentId;


}

entity teacher : cuid {

    key studentId : String(10);
        firstName : localized String(100);
        student   : Association to student
                        on student.studentId = studentId;


}
