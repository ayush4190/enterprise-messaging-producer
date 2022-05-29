using { sap.capire.enterpriseMessagingProducer as db}  from '../db/schema';

service EnterpriseMessagingProducerService {

    entity Students as projection on db.student;


}
