'use strict';

const { isBuiltinType } = require('../model/csnUtils');

/**
 * Prepare the ref steps so that they are loggable
 *
 * @param {any} refStep part of a ref
 * @returns {string} Loggable string
 */
function logReady(refStep) {
  return refStep.id || refStep;
}

/**
 * Check that the opposite operand to a relational term is something
 * structured that can be used for tuple expansion. This can either be a
 * real 'elements' thing or a managed association/composition with foreign keys.
 *
 * @param {Array} on the on condition which to check
 * @param {number} startIndex the index of the relational term in the on condition array
 * @returns {boolean} indicates whether the other side of a relational term is expandable
 */
function otherSideIsExpandableStructure(on, startIndex) {
  if (on[startIndex - 1] && [ '=', '<', '>', '>=', '<=', '!=', '<>' ].includes(on[startIndex - 1]))
    return isOk(resolveArtifactType.call(this, on[startIndex - 2]._art));

  else if (on[startIndex + 1] && [ '=', '<', '>', '>=', '<=', '!=', '<>' ].includes(on[startIndex + 1]))
    return isOk(resolveArtifactType.call(this, on[startIndex + 2]._art));

  return false;

  /**
   * Artifact is structured or a managed association/compoisition
   *
   * @param {CSN.Artifact} art Artifact
   * @returns {boolean} True if expandable
   */
  function isOk(art) {
    return !!(art && (art.elements || (art.target && art.keys)));
  }
}

/**
 * Get the real type of an artifact
 *
 * @param {object} art Whatever _art by csnRefs can be - element or artifact
 * @returns {object} final artifact type
 */
function resolveArtifactType(art) {
  if (art && art.type && !isBuiltinType(art.type))
    return this.getFinalBaseType(art);

  return art;
}

module.exports = {
  logReady,
  otherSideIsExpandableStructure,
  resolveArtifactType,
};
