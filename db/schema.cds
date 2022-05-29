namespace sap.capire.enterpriseMessagingProducer;

 using {  cuid, managed } from '@sap/cds/common';


entity student : cuid , managed {

    firstName : localized String(100);
    lastName : localized String(100);
    dateOfBirth : Date;
    placeOfBirth : String(100);
    currentClass : String(10);
    
}



