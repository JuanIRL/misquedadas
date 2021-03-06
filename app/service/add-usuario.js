/*
 * misquedadas2 - https://github.com/JuanIRL/misquedadas.git
 *
 * Copyright (c) 2018
 */

/**
 * @module mq2/service/add-asiste
 *
 * @requires lodash
 * @requires module:mq2/args
 * @requires module:mq2/db
 * @requires module:mq2/logger
 */

'use strict';

const _      = require('lodash');

const args   = require('app/args');
const db     = require('app/db');
const logger = require('app/logger').getLogger('mq2.service');


/**
 * Statement for all databases.
 * @type {string}
 */
const SQL_ADD_USUARIO = [
  'INSERT INTO usuario VALUES ({nombre},{clave},{edad},{imagen})'
].join('\n');

/**
 *
 * @param parametros de momento
 * @return {promise} the promise resolve callback has the parameter, that has all databases from mysql server.
 */
module.exports.execute = function (parametros) {
  return db.getConnection()
    .then(function (conn) {
      const nombre = _preparePattern(parametros.nombre);
      const clave = _preparePattern(parametros.clave);
      const edad = parametros.edad//_preparePattern(parametros.edad);
      const imagen = _preparePattern(parametros.imagen);
      var sqlStatement = SQL_ADD_USUARIO;
      var params = {};
      params.nombre = nombre;
      params.clave = clave;
      params.edad = edad;
      params.imagen = imagen;

      return conn.query(sqlStatement, params)
        .then(function (databases) {
          if (args.isVerbose()) {
            logger.debug('Your usuario: ', JSON.stringify(databases));
          }
          var result = [];
          // _.forEach(databases, function (db) {
          //   const name = _.values(db)[0];
          //   result.push(name);
          // });
          return result;
        })
        .finally(function () {
          // release the db connection
          conn.release();
        });
    });
};

/**
 * Prepare the pattern and replace all '
 * @param {string|null} pattern the like pattern
 * @return {string|null}
 * @private
 */
function _preparePattern(pattern) {
  if (!pattern) {
    return null;
  }
  return pattern.replace(/\*/g, '%');
}
