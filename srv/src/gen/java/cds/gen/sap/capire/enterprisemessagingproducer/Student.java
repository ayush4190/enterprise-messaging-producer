package cds.gen.sap.capire.enterprisemessagingproducer;

import com.sap.cds.CdsData;
import com.sap.cds.Struct;
import com.sap.cds.ql.CdsName;
import java.lang.String;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CdsName("sap.capire.enterpriseMessagingProducer.student")
public interface Student extends CdsData {
  String ID = "ID";

  String CREATED_AT = "createdAt";

  String CREATED_BY = "createdBy";

  String MODIFIED_AT = "modifiedAt";

  String MODIFIED_BY = "modifiedBy";

  String FIRST_NAME = "firstName";

  String LAST_NAME = "lastName";

  String DATE_OF_BIRTH = "dateOfBirth";

  String PLACE_OF_BIRTH = "placeOfBirth";

  String CURRENT_CLASS = "currentClass";

  String TEXTS = "texts";

  String LOCALIZED = "localized";

  @CdsName(ID)
  String getId();

  @CdsName(ID)
  void setId(String id);

  Instant getCreatedAt();

  void setCreatedAt(Instant createdAt);

  /**
   * Canonical user ID
   */
  String getCreatedBy();

  /**
   * Canonical user ID
   */
  void setCreatedBy(String createdBy);

  Instant getModifiedAt();

  void setModifiedAt(Instant modifiedAt);

  /**
   * Canonical user ID
   */
  String getModifiedBy();

  /**
   * Canonical user ID
   */
  void setModifiedBy(String modifiedBy);

  String getFirstName();

  void setFirstName(String firstName);

  String getLastName();

  void setLastName(String lastName);

  LocalDate getDateOfBirth();

  void setDateOfBirth(LocalDate dateOfBirth);

  String getPlaceOfBirth();

  void setPlaceOfBirth(String placeOfBirth);

  String getCurrentClass();

  void setCurrentClass(String currentClass);

  List<StudentTexts> getTexts();

  void setTexts(List<? extends Map<String, ?>> texts);

  StudentTexts getLocalized();

  void setLocalized(Map<String, ?> localized);

  Student_ ref();

  static Student create() {
    return Struct.create(Student.class);
  }
}
