/* eslint no-use-before-define: 0 */

'use strict';

var Tree = require('../../../models/tree');
var Joi = require('joi');

exports.register = function(server, options, next){
  server.route({
    method: 'PUT',
    path: '/trees/{treeId}/grow',
    config: {
      validate: {
        params: {
          treeId: Joi.string().hex().length(24).required()
        }
      },
      description: 'Grow a tree',
      handler: function(request, reply){
        Tree.findOne({ownerId: request.auth.credentials._id, _id: request.params.treeId}, function(findErr, tree){
          if(findErr){ return reply().code(400); }
          var max = 50000;

          var odds = tree.height / max;
          if(odds > 0.90){ odds = 0.90; }
          var roll = Math.random();

          if(roll < odds){
            tree.health -= Math.floor(Math.random() * 26);
          }else{
            tree.height += Math.floor(Math.random() * 51);
          }

          if(tree.height > max){ tree.height = max; }

          if(tree.health > 0){
            tree.save(send);
          }else{
            tree.remove(send);
          }

          function send(changeErr, t){
            return reply(t).code(changeErr ? 400 : 200);
          }
        });
      }
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'trees.grow'
};
