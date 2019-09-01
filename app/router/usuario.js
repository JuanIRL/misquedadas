/*
 * misquedadas2 - https://github.com/DiegoMartindeAndres/misquedadas.git
 *
 * Copyright (c) 2018
 */

/**
 * @module mq2/router/api-usuario
 *
 * @requires express
 * @requires mq2/executor
 * @requires mq2/service/get-usuarios
 */

'use strict';

const express = require('express');
const path      = require('path');

const executor      = require('app/executor');
const showQuedadas = require('app/service/get-quedadas');
const showUsuario = require('app/service/get-usuario');
const showQuedada = require('app/service/get-quedada');
const showAsiste = require('app/service/get-asiste');
const removeAsiste = require('app/service/remove-asiste');
const showAsistencia = require('app/service/get-asistencia');
const showCoordenada = require('app/service/get-coordenadasQuedada.js');
const removeQuedada = require('app/service/remove-quedada');
const addQuedada = require('app/service/add-quedada');
const showSitios = require('app/service/get-sitios');
const showSitiosBorrables = require('app/service/get-sitiosBorrables');
const removeUsuario = require('app/service/remove-usuario');
const showUsuarios = require('app/service/get-usuarios');
const addUsuario = require('app/service/add-usuario');

const fileUpload = require('express-fileupload');

const _ = require('lodash');

const configUtil      = require('../config-util');
var def = require('../../misquedadas-2.json');

const router = express.Router({
  caseSensitive: true,
  mergeParams: true,
  strict: true
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //console.log("Está autenticado?: ",req.isAuthenticated());


  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

module.exports = function(app,passport){

  router.get('/', isLoggedIn ,function (req, res) {
    var nombre = req.session.passport.user;
    var params = {};
    params.nombre = nombre;

    // Buscar por el usuario o mandar el error
    Promise.all([showUsuario.execute(params), showAsistencia.execute(nombre), showQuedadas.execute()])
    .catch(
      function(err) {
        console.log(err); // some coding error in handling happened
        res.render('error',{message:err.messagge, error:err});
        //done(err,null);
      })
      .then(values => {
        var quedadas = values[2].quedadas;
        var quedadasAsisto = values[1];
        var usuario = values[0][0];
        usuario.clave = "";
        var quedada = {"que":"placeholder"};
        res.render('usuario', {quedadasAsisto: quedadasAsisto, usuario: usuario,user: nombre, quedadas: quedadas, quedada: quedada});
      });

  });

  router.get('/delete', isLoggedIn ,function (req, res) {
    var nombre = req.session.passport.user;
    var params = {};
    params.nombre = nombre;
    params.que = "%"

    // Buscar por el usuario o mandar el error
    Promise.all([removeUsuario.execute(params), removeAsiste.execute(params)])
    .catch(
      function(err) {
        console.log(err); // some coding error in handling happened
        res.render('error',{message:err.messagge, error:err});
        //done(err,null);
      })
      .then(values => {
        req.logout();
        res.redirect('/login');
      });

  });

  router.post('/nuevo', function (req, res) {
      var params = {};
      params.nombre = req.body.NOMBRE;
      params.clave = req.body.CLAVE;
      params.edad = req.body.EDAD;
      params.imagen = params.nombre + ".jpg";
      var imagen = req.files.IMAGEN;
      Promise.all([addUsuario.execute(params)])
      .catch(function(err){
        console.log(err); // some coding error in handling happened
        res.render('error',{message:err.messagge, error:err});
      }).then(function(values){
        if (Object.keys(imagen).length == 0) {
          return res.status(400).send('No files were uploaded.');
        }
        console.log(__dirname);
        imagen.mv('app/public/img/' + params.imagen, function(err) {
          if (err){
            return res.status(500).send(err);
          }
          res.redirect('/login');
        });
      });
  });

  router.get('/nuevo', function (req, res) {
    Promise.all([showUsuarios.execute()])
    .catch(function(err){
      console.log(err); // some coding error in handling happened
      res.render('error',{message:err.messagge, error:err});
    }).then(function(values){
        var usuarios = values[0];
        res.render('signin',{message:"", error:"", usuarios: usuarios});
      });

  });
  app.use('/usuario', router);
}

//
// Exports the router
//
//module.exports = router;
