'use strict';

/**
 * This class file is the base "class" for myelin.
 * Since there aren't classes, this is used as a
 * definition for the skill tree and prompt.
 */
module.exports = srcPath => {
  return {
    // Set up player prompt and other business:
    setupPlayer(player) {
      player.prompt = '[ %health.current%/%health.max% <b>health</b> %focus.current%/%focus.max% <b>focus</b> %energy.current%/%energy.max% <b>energy</b> ]';
    },

    abilityTable: {
      skills: {

        /* Physicalist: */

        block: {
          level: 4,
          might: 15,
          willpower: 10,
        },
        dodge: {
          level: 4,
          quickness: 15,
          intellect: 10
        },
        lunge: {
          level: 1,
          quickness: 15,
        },
        secondwind: {
          level: 1,
          might: 9,
          willpower: 9,
          quickness: 9,
          cost: 1
        },
        bash: {
          level: 1,
          might: 15
        },
        nervestrike: {
          level: 3,
          quickness: 15,
          might: 8,
          willpower: 9
        },
        rend: {
          level: 3,
          quickness: 13,
          might: 13
        },

        /* Mentalist: */
        leatherskin: {
          level: 3,
          willpower: 16
        },
        ironskin: {
          level: 8,
          willpower: 16,
          might: 10,
          skills: ['leatherskin']
        },
        mend: {
          level: 1,
          intellect: 13,
          willpower: 12,
          cost: 1
        },
        enervate: {
          level: 1,
          intellect: 14,
          willpower: 11
        },
        empower: {
          level: 5,
          willpower: 18
        },

        combust: {
          level: 1,
          intellect: 15,
          willpower: 7,
          cost: 1
        },
        flare: {
          level: 4,
          intellect: 15,
          willpower: 7,
          cost: 1,
          skills: ['combust']
        },

        concentration: {
          level: 1,
          intellect: 9,
          willpower: 12,
          cost: 1
        },
        tactics: {
          level: 5,
          intellect: 13,
          quickness: 10
        },
        weaken: {
          level: 4,
          intellect: 12,
          willpower: 10
        },
        stupefy: {
          level: 4,
          willpower: 12,
          intellect: 10
        }
      }
    }
  };
};