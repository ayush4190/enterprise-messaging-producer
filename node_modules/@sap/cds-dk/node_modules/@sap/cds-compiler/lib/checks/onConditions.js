'use strict';

const { forEachGeneric } = require('../model/csnUtils');
const { otherSideIsExpandableStructure, resolveArtifactType } = require('./utils');

// Only to be used with validator.js - a correct this value needs to be provided!

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
 * Check that the other side of the comparison is a valid $self backlink
 *
 * - operator "="
 * - nothing but "$self", no further steps
 *
 * @param {Array} on On-Condition
 * @param {number} startIndex Index of the current expression to "look around"
 * @returns {boolean} True if valid
 */
function otherSideIsValidDollarSelf(on, startIndex) {
  if (on[startIndex - 1] && on[startIndex - 1] === '=') {
    if (on[startIndex - 2]) {
      const { ref } = on[startIndex - 2];
      return ref && ref.length === 1 && ( ref[0] === '$self' || ref[0] === '$projection' );
    }
    return false;
  }
  else if (on[startIndex + 1] && on[startIndex + 1] === '=') {
    if (on[startIndex + 2]) {
      const { ref } = on[startIndex + 2];
      return ref && ref.length === 1 && ( ref[0] === '$self' || ref[0] === '$projection' );
    }
    return false;
  }
  return false;
}

/**
 * Validate an on-condition
 *
 * - no traversal of unmanaged associations
 * - only use managed associations to access their foreign keys
 * - no filters
 * - no parameters
 * - must end in scalar type - unless $self comparison
 *
 * @param {object} member Member
 * @param {string} memberName Name of the member
 * @param {string} property Current property (part of forEachMember)
 * @param {CSN.Path} path CSN Path to current member
 */
function validateOnCondition(member, memberName, property, path) {
  if (member && member.on) {
    // complain about nullability constraint on managed composition
    if (member.targetAspect && {}.hasOwnProperty.call(member, 'notNull')) {
      this.warning(null, path.concat([ 'on' ]),
                   'Unexpected nullability constraint defined on managed composition');
    }
    for (let i = 0; i < member.on.length; i++) {
      if (member.on[i].ref) {
        const { ref } = member.on[i];
        // eslint-disable-next-line prefer-const
        let { _links, _art, $scope } = member.on[i];
        if (!_links)
          continue;
        const validDollarSelf = otherSideIsValidDollarSelf(member.on, i);
        const validStructuredElement = otherSideIsExpandableStructure.call(this, member.on, i);
        for (let j = 0; j < _links.length - 1; j++) {
          const csnPath = path.concat([ 'on', i, 'ref', j ]);

          // For error messages
          const id = logReady(ref[j]);
          const elemref = { ref };

          if (_links[j].art.target && !((_links[j].art === member) || ref[j] === '$self' || ref[j] === '$projection' || (validDollarSelf && j === _links.length - 1))) {
            if (_links[j].art.on) {
              // It's an unmanaged association - traversal is always forbidden
              this.error(null, csnPath, { id, elemref }, 'ON-Conditions can\'t follow unmanaged associations, step $(ID) of path $(ELEMREF)');
            }
            else {
              // It's a managed association - access of the foreign keys is allowed
              const nextRef = ref[j + 1].id || ref[j + 1];
              if (!_links[j].art.keys.some(r => r.ref[0] === nextRef))
                this.error(null, csnPath, { id, elemref }, 'ON-Conditions can only follow managed associations to the foreign keys of the managed association, step $(ID) of path $(ELEMREF)');
            }
          }

          if (_links[j].art.virtual)
            this.error(null, csnPath, { id, elemref }, 'Virtual elements can\'t be used in ON-Conditions, step $(ID) of path $(ELEMREF)');

          if (ref[j].where)
            this.error(null, csnPath, { id, elemref }, 'ON-Conditions must not contain filters, step $(ID) of path $(ELEMREF)');

          if (ref[j].args)
            this.error(null, csnPath, { id, elemref }, 'ON-Conditions must not contain parameters, step $(ID) of path $(ELEMREF)');
        }
        if (_art && $scope !== '$self') {
          _art = resolveArtifactType.call(this, _art);
          // For error messages
          const onPath = path.concat([ 'on', i, 'ref', ref.length - 1 ]);
          // Paths of an ON condition may end on a structured element or an association only if:
          // 1) Both operands in the expression end on a structured element or on
          //    a managed association (that are both expandable)
          // 2) Path ends on an association (managed or unmanaged) and the other operand is a '$self'

          // If this path ends structured or on an association, perform the check:
          if ((_art.target) &&
             !( /* 1) */ (_art.target && _art.keys) && validStructuredElement ||
             /* 2) */ (_art.target && validDollarSelf)) &&
             !_art.virtual) {
            this.error(null, onPath, { elemref: { ref } },
                       'The last path of an on-condition must be a scalar value, path $(ELEMREF)');
          }
          else if (_art.items && !_art.virtual) {
            this.error(null, onPath, { elemref: { ref } },
                       'ON-Conditions can\'t use array-like elements, path $(ELEMREF)');
          }
          else if (_art.virtual) {
            this.error(null, onPath, { elemref: { ref } },
                       'Virtual elements can\'t be used in ON-Conditions, path $(ELEMREF)');
          }
        }
      }
    }
  }
}

/**
 * Run the above validations also for mixins.
 *
 * @param {CSN.Query} query query object
 * @param {CSN.Path} path path to the query
 */
function validateMixinOnCondition(query, path) {
  if (query.SELECT && query.SELECT.mixin)
    forEachGeneric( query.SELECT, 'mixin', validateOnCondition.bind(this), path );
}

module.exports = { validateOnCondition, validateMixinOnCondition };
