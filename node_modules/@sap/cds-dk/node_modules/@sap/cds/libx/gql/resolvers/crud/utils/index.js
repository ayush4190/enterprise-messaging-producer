const getEntityNameWithoutServicePrefix = (service, entityFQN) => entityFQN.replace(`${service.name}.`, '')

const getEntityByFQN = (service, entityFQN) => service.entities[getEntityNameWithoutServicePrefix(service, entityFQN)]

const objectStructureToEntityStructure = (service, entityFQN, entry) => {
  const entity = getEntityByFQN(service, entityFQN)
  for (const [k, v] of Object.entries(entry)) {
    const element = entity.elements[k]
    if (element.isComposition || element.isAssociation) {
      if (Array.isArray(v)) {
        if (element.is2one) {
          entry[k] = v[0]
        }
      } else if (typeof v === 'object') {
        if (element.is2many) {
          entry[k] = [v]
        }
      }
      entriesStructureToEntityStructure(service, element.target, v)
    }
  }
  return entry
}

const entriesStructureToEntityStructure = (service, entityFQN, entries) => {
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      objectStructureToEntityStructure(service, entityFQN, entry)
    }
  } else {
    objectStructureToEntityStructure(service, entityFQN, entries)
  }
  return entries
}

module.exports = { entriesStructureToEntityStructure }
