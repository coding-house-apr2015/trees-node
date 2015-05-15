/* eslint no-use-before-define: 0 */

'use strict';

var Tree = require('../../../models/tree');
var Joi = require('joi');
var Async = require('async');

exports.register = function(server, options, next){
  server.route({
    method: 'PUT',
    path: '/trees/plague/{damage}',
    config: {
      validate: {
        params: {
          damage: Joi.number().required()
        }
      },
      description: 'Tree plague',
      handler: function(request, reply){
        var max = 50000;
        Tree.find({ownerId: request.auth.credentials._id, height: {$lt: max}}, function(err, trees){
          if(err){ return reply().code(400); }

          trees = trees.map(function(tree){
            var damage = Math.floor(Math.random() * (request.params.damage + 1));
            tree.health -= damage;
            return tree;
          });

          var alive = trees.filter(function(tree){
            return tree.health > 0;
          });

          var dead = trees.filter(function(tree){
            return tree.health <= 0;
          });

          Async.each(alive, function(tree, cb){ tree.save(cb); }, function(){
            Async.each(dead, function(tree, cb){ tree.remove(cb); }, function(){
              return reply();
            });
          });
        });
      }
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'trees.plague'
};
