'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
/**
 * Command for items with `usable` behavior. See bundles/ranvier-areas/areas/limbo/items.yml for
 * example behavior implementation
 */
module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const { CommandParser } = require(srcPath + 'CommandParser');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');
  const SkillErrors = require(srcPath + 'SkillErrors');

  return {
    aliases: [ 'quaff', 'recite' ],
    command: state => (args, player) => {
      console.log('Using!! ', args);
      const say = message => Broadcast.sayAt(player, message);

      if (!args.length) {
        return say("Use what?");
      }

      const item = CommandParser.parseDot(args, player.inventory);

      if (!item) {
        return say("You don't have anything like that.");
      }

      const usable = item.getBehavior('usable');
      if (!usable) {
        //TODO: Make better. Special portal code...
        if (item.entityReference.includes('key')){
          if (player.room.hasBehavior('portal')) {
            say("<b>You use the key...</b>");
            return player.room.emit('usePortal', player, item);
          }
          return say("You can't use that here.");
        }
        return say("You can't use that.");
      }

      console.log('Is usable!');

      if ('charges' in usable && usable.charges <= 0) {
        return say(`You've used up ${ItemUtil.display(item)}.`);
      }

      if (usable.ability) {
        const useSpell = state.SkillManager.get(usable.ability);

        if (!useSpell) {
          Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);
          return say("You can't use that.");
        }

        useSpell.options = usable.options;
        if (usable.cooldown) {
          useSpell.cooldownLength = usable.cooldown;
        }

        try {
          useSpell.execute(/* args */ null, player);
        } catch (e) {
          if (e instanceof SkillErrors.CooldownError) {
            return say(`${useSpell.name} is on cooldown. ${humanize(e.effect.remaining)} remaining.`);
          }

          if (e instanceof SkillErrors.PassiveError) {
            return say(`That skill is passive.`);
          }

          if (e instanceof SkillErrors.NotEnoughResourcesError) {
            return say(`You do not have enough resources.`);
          }

          Logger.error(e.message);
          Broadcast.sayAt(this, 'Huh?');
        }
      }

      if (usable.effect) {
        const effectConfig = Object.assign({
          name: item.name
        }, usable.config || {});
        const effectState = usable.state || {};

        let useEffect = state.EffectFactory.create(usable.effect, player, effectConfig, effectState);
        if (!useEffect) {
          Logger.error(`Item: ${item.entityReference} has invalid usable configuration.`);
          return say("You can't use that.");
        }

        if (!player.addEffect(useEffect)) {
          return say("Nothing happens.");
        }
      }

      if (!('charges' in usable)) {
        return;
      }

      usable.charges--;

      if (usable.destroyOnDepleted && usable.charges <= 0) {
        say(`You used up ${ItemUtil.display(item)}.`);
        state.ItemManager.remove(item);
      }
    }
  };
};
