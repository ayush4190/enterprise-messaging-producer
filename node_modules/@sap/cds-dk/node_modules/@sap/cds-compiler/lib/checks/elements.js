'use strict';

const { forEachMember, forEachMemberRecursively } = require('../model/csnUtils');
const { isGeoTypeName } = require('../compiler/builtins');

// Only to be used with validator.js - a correct `this` value needs to be provided!

/**
 * Checks artifact's primary keys and an error is registered if some of the keys
 * is of type 'cds.hana.ST_POINT', 'cds.hana.ST_GEOMETRY' or if it is arrayed
 *
 * @param {CSN.Artifact} art The artifacts that will be checked
 */
function checkPrimaryKey(art) {
  if (art.kind !== 'entity' && art.kind !== 'aspect')
    return;
  forEachMember(art, (member, memberName, prop, path) => {
    checkIfPrimaryKeyIsOfGeoType.bind(this)(member, memberName);
    checkIfPrimaryKeyIsArray.bind(this)(member, memberName);
    if (member.elements) {
      forEachMemberRecursively(member, (subMember, subMemberName) => {
        checkIfPrimaryKeyIsOfGeoType.bind(this)(subMember, subMemberName, member.key);
        checkIfPrimaryKeyIsArray.bind(this)(subMember, subMemberName, member.key);
      },
                               path);
    }
  });

  /**
   *
   * @param {CSN.Element} member The member
   * @param {string} elemFqName Full name of the element following the structure,
   *                            concatenated with '/', used for error reporting
   * @param {boolean} parentIsKey Whether parent is a key
   * @param {CSN.Path} parentPath The path of the parent element (optional)
   */
  function checkIfPrimaryKeyIsOfGeoType(member, elemFqName, parentIsKey, parentPath) {
    if (member.key || parentIsKey) {
      const finalBaseType = this.csnUtils.getFinalBaseType(member.type);
      if (typeof finalBaseType === 'string' && isGeoTypeName(finalBaseType)) {
        this.error(null, parentPath || member.$path,
                   { type: finalBaseType, name: elemFqName },
                   'Type $(TYPE) can\'t be used as primary key in element $(NAME)');
      }
      else if (finalBaseType && this.csnUtils.isStructured(finalBaseType)) {
        forEachMemberRecursively(finalBaseType,
                                 (subMember, subMemberName) => checkIfPrimaryKeyIsOfGeoType
                                   .bind(this)(subMember,
                                               `${ elemFqName }/${ subMemberName }`,
                                               member.key || parentIsKey,
                                               member.$path));
      }
    }
  }

  /**
   *
   * @param {CSN.Element} member The member
   * @param {string} elemFqName Full name of the element following the structure,
   *                            concatenated with '/', used for error reporting
   * @param {boolean} parentIsKey Whether parent is a key
   * @param {CSN.Path} parentPath The path of the parent element (optional)
   */
  function checkIfPrimaryKeyIsArray(member, elemFqName, parentIsKey, parentPath) {
    if (member.key || parentIsKey) {
      const finalBaseType = this.csnUtils.getFinalBaseType(member.type);
      if (member.items || (finalBaseType && finalBaseType.items)) {
        this.error(null, parentPath || member.$path, { name: elemFqName },
                   'Array-like type in element $(NAME) can\'t be used as primary key');
      }
      else if (finalBaseType && this.csnUtils.isStructured(finalBaseType)) {
        forEachMemberRecursively(finalBaseType,
                                 (subMember, subMemberName) => checkIfPrimaryKeyIsArray
                                   .bind(this)(subMember,
                                               `${ elemFqName }/${ subMemberName }`,
                                               member.key || parentIsKey,
                                               member.$path));
      }
    }
  }
}

/**
 * Checks virtual elelemts and throws an error if some is either structured or
 * an association
 *
 * @param {CSN.Element} member Element to be checked
 */
function checkVirtualElement(member) {
  if (member.virtual) {
    if (this.csnUtils.isAssociation(member.type)) { // or Composition ???
      this.error(null, member.$path, `Element can't be virtual and an association`);
    }
  }
}

/**
 * Checks whether managed associations
 * with cardinality 'to many' have an on-condition
 * and if managed associations have foreign keys.
 *
 * @param {CSN.Artifact} art The artifact
 */
function checkManagedAssoc(art) {
  forEachMemberRecursively(art, (member) => {
    if (this.csnUtils.isAssocOrComposition(member.type) &&
        !isManagedComposition.bind(this)(member)) {
      if (member.on)
        return;
      const max = member.cardinality && member.cardinality.max;
      if (max === '*' || Number(max) > 1) {
        const isNoDb = art['@cds.persistence.skip'] || art['@cds.persistence.exists'];
        this.warning(isNoDb ? 'to-many-no-on-noDB' : 'to-many-no-on', member.cardinality ? member.cardinality.$path : member.$path,
                     { '#': this.csnUtils.isComposition(member.type) ? 'cmp' : 'std' },
                     {
                       std: 'An association can\'t have cardinality "to many" without an ON-condition',
                       cmp: 'A composition can\'t have cardinality "to many" without an ON-condition',
                     });
      }
    }
  });

  /**
   *
   * @param {CSN.Element} member The member
   * @returns {boolean} Whether the member is managed composition
   */
  function isManagedComposition(member) {
    if (member.targetAspect)
      return true;
    if (!member.target)
      return false;
    const target = typeof member.target === 'object' ? member.target : this.csnUtils.getCsnDef(member.target);
    return target.kind !== 'entity';
  }
}

module.exports = { checkPrimaryKey, checkVirtualElement, checkManagedAssoc };
