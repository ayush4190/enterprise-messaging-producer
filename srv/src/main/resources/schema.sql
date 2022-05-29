DROP VIEW IF EXISTS localized_fr_EnterpriseMessagingProducerService_Students;
DROP VIEW IF EXISTS localized_de_EnterpriseMessagingProducerService_Students;
DROP VIEW IF EXISTS localized_fr_sap_capire_enterpriseMessagingProducer_student;
DROP VIEW IF EXISTS localized_de_sap_capire_enterpriseMessagingProducer_student;
DROP VIEW IF EXISTS localized_EnterpriseMessagingProducerService_Students;
DROP VIEW IF EXISTS localized_sap_capire_enterpriseMessagingProducer_student;
DROP VIEW IF EXISTS EnterpriseMessagingProducerService_Students_texts;
DROP VIEW IF EXISTS EnterpriseMessagingProducerService_Students;

DROP TABLE IF EXISTS sap_capire_enterpriseMessagingProducer_student_texts;
DROP TABLE IF EXISTS sap_capire_enterpriseMessagingProducer_student;

CREATE TABLE sap_capire_enterpriseMessagingProducer_student (
  ID NVARCHAR(36) NOT NULL,
  createdAt TIMESTAMP,
  createdBy NVARCHAR(255),
  modifiedAt TIMESTAMP,
  modifiedBy NVARCHAR(255),
  firstName NVARCHAR(100),
  lastName NVARCHAR(100),
  dateOfBirth DATE,
  placeOfBirth NVARCHAR(100),
  currentClass NVARCHAR(10),
  PRIMARY KEY(ID)
);

CREATE TABLE sap_capire_enterpriseMessagingProducer_student_texts (
  locale NVARCHAR(14) NOT NULL,
  ID NVARCHAR(36) NOT NULL,
  firstName NVARCHAR(100),
  lastName NVARCHAR(100),
  PRIMARY KEY(locale, ID)
);

CREATE VIEW EnterpriseMessagingProducerService_Students AS SELECT
  student_0.ID,
  student_0.createdAt,
  student_0.createdBy,
  student_0.modifiedAt,
  student_0.modifiedBy,
  student_0.firstName,
  student_0.lastName,
  student_0.dateOfBirth,
  student_0.placeOfBirth,
  student_0.currentClass
FROM sap_capire_enterpriseMessagingProducer_student AS student_0;

CREATE VIEW EnterpriseMessagingProducerService_Students_texts AS SELECT
  texts_0.locale,
  texts_0.ID,
  texts_0.firstName,
  texts_0.lastName
FROM sap_capire_enterpriseMessagingProducer_student_texts AS texts_0;

CREATE VIEW localized_sap_capire_enterpriseMessagingProducer_student AS SELECT
  L_0.ID,
  L_0.createdAt,
  L_0.createdBy,
  L_0.modifiedAt,
  L_0.modifiedBy,
  coalesce(localized_1.firstName, L_0.firstName) AS firstName,
  coalesce(localized_1.lastName, L_0.lastName) AS lastName,
  L_0.dateOfBirth,
  L_0.placeOfBirth,
  L_0.currentClass
FROM (sap_capire_enterpriseMessagingProducer_student AS L_0 LEFT JOIN sap_capire_enterpriseMessagingProducer_student_texts AS localized_1 ON localized_1.ID = L_0.ID AND localized_1.locale = 'en');

CREATE VIEW localized_EnterpriseMessagingProducerService_Students AS SELECT
  student_0.ID,
  student_0.createdAt,
  student_0.createdBy,
  student_0.modifiedAt,
  student_0.modifiedBy,
  student_0.firstName,
  student_0.lastName,
  student_0.dateOfBirth,
  student_0.placeOfBirth,
  student_0.currentClass
FROM localized_sap_capire_enterpriseMessagingProducer_student AS student_0;

CREATE VIEW localized_de_sap_capire_enterpriseMessagingProducer_student AS SELECT
  L_0.ID,
  L_0.createdAt,
  L_0.createdBy,
  L_0.modifiedAt,
  L_0.modifiedBy,
  coalesce(localized_de_1.firstName, L_0.firstName) AS firstName,
  coalesce(localized_de_1.lastName, L_0.lastName) AS lastName,
  L_0.dateOfBirth,
  L_0.placeOfBirth,
  L_0.currentClass
FROM (sap_capire_enterpriseMessagingProducer_student AS L_0 LEFT JOIN sap_capire_enterpriseMessagingProducer_student_texts AS localized_de_1 ON localized_de_1.ID = L_0.ID AND localized_de_1.locale = 'de');

CREATE VIEW localized_fr_sap_capire_enterpriseMessagingProducer_student AS SELECT
  L_0.ID,
  L_0.createdAt,
  L_0.createdBy,
  L_0.modifiedAt,
  L_0.modifiedBy,
  coalesce(localized_fr_1.firstName, L_0.firstName) AS firstName,
  coalesce(localized_fr_1.lastName, L_0.lastName) AS lastName,
  L_0.dateOfBirth,
  L_0.placeOfBirth,
  L_0.currentClass
FROM (sap_capire_enterpriseMessagingProducer_student AS L_0 LEFT JOIN sap_capire_enterpriseMessagingProducer_student_texts AS localized_fr_1 ON localized_fr_1.ID = L_0.ID AND localized_fr_1.locale = 'fr');

CREATE VIEW localized_de_EnterpriseMessagingProducerService_Students AS SELECT
  student_0.ID,
  student_0.createdAt,
  student_0.createdBy,
  student_0.modifiedAt,
  student_0.modifiedBy,
  student_0.firstName,
  student_0.lastName,
  student_0.dateOfBirth,
  student_0.placeOfBirth,
  student_0.currentClass
FROM localized_de_sap_capire_enterpriseMessagingProducer_student AS student_0;

CREATE VIEW localized_fr_EnterpriseMessagingProducerService_Students AS SELECT
  student_0.ID,
  student_0.createdAt,
  student_0.createdBy,
  student_0.modifiedAt,
  student_0.modifiedBy,
  student_0.firstName,
  student_0.lastName,
  student_0.dateOfBirth,
  student_0.placeOfBirth,
  student_0.currentClass
FROM localized_fr_sap_capire_enterpriseMessagingProducer_student AS student_0;

