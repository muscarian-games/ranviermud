'use strict';

module.exports = (srcPath) => {

  return  {
    listeners: {
      get: state => function (player) {
        const effect = state.EffectFactory.create('resource.buff', player, { source: this.uuid });
      	player.addEffect(effect);
      },
      drop: state => function (player) {
        const effect = player.effects.filterByType('resource.buff').filter(eff => effect.config.source === this.uuid);
        player.removeEffect(effect);
      }
    }
  };
};
