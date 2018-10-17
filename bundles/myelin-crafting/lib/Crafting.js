'use strict';

const srcPath = '../../../src/';

const Logger = require(srcPath + 'Logger');
const Data = require(srcPath + 'Data');
const Item = require(srcPath + 'Item');
const ItemType = require(srcPath + 'ItemType');

const dataPath = __dirname + '/../data/';
const _loadedResources = Data.parseFile(dataPath + 'resources.yml');
const _loadedRecipes = Data.parseFile(dataPath + 'recipes.yml');
console.log(_loadedRecipes);
const qualityMap = {
  poor: 1,
  common: 3,
  uncommon: 5,
  rare: 8,
  epic: 10
};

let _cachedCraftingCategories = null;

let searchResults = {}

class Crafting {
  static getResource(resourceKey) {
    return _loadedResources[resourceKey];
  }

  static getCraftByKeyword(state, query) {
    if (searchResults[query]) return searchResults[query];
    const categories = Crafting.getCraftingCategories(state);

    const results = [];
    for (const category of categories) {
      const findings = category.items.filter(recipe => 
        recipe.item.name.includes(query) || 
        recipe.item.keywords.includes(query) ||
        recipe.item.keywords.some(keyword => keyword.includes(query))
      );
      console.log('Found ', findings, 'in ', category.title);
      results.push(...findings);
    }
    console.log('Overall found', results);
    searchResults[query] = results;
    return results;
  }

  static getCraftingCategories(state) {
    if (_cachedCraftingCategories) {
      return _cachedCraftingCategories;
    }

    let craftingCategories = [
      {
        type: ItemType.POTION,
        title: "Consumable",
        items: []
      },
      {
        type: ItemType.WEAPON,
        title: "Weapon",
        items: []
      },
      {
        type: ItemType.ARMOR,
        title: "Armor",
        items: []
      },
      {
        type: ItemType.CONTAINER,
        title: "Containers",
        items: []
      },
    ];

    const recipes = Crafting.getRecipes();
    for (const recipe of recipes) {
      const recipeItem = state.ItemFactory.create(
        state.AreaManager.getAreaByReference(recipe.item),
        recipe.item
      );

      const catIndex = craftingCategories.findIndex(cat => {
        return cat.type === recipeItem.type;
      });

      if (catIndex === -1) {
        Logger.warn(`Category not found for ${recipeItem.name}`);
        continue;
      }

      recipeItem.hydrate(state);
      const items = craftingCategories[catIndex].items;
      items.push({
        index: items.length,
        item: recipeItem,
        recipe: recipe.recipe,
        category: catIndex,
      });
  }

    _cachedCraftingCategories = craftingCategories;
    return craftingCategories;
  }

  static getRecipeEntries(item) {
    return Object.entries(item.recipe);
  }

  static canCraft(player, recipeEntries) {
    for (const [resource, recipeRequirement] of recipeEntries) {
      const playerResource = player.getMeta(`resources.${resource}`) || 0;
      if (playerResource < recipeRequirement) {
        const resItem = Crafting.getResourceItem(resource);
        return {success: false, name: resItem.name, difference: recipeRequirement - playerResource };
      }
    }
    return {success: true}
  }

  static getExperience(totalRequired, quality = 'common') {
    return Math.ceil(totalRequired / 5) * qualityMap[quality];
  }

  static getResourceItem(resourceKey) {
    const resourceDef = this.getResource(resourceKey);
    if (!resourceDef) {
      return Logger.error('Invalid or missing resource definition.');
    }
    // create a temporary fake item for the resource for rendering purposes
    return new Item(null, {
      name: resourceDef.title,
      metadata: {
        quality: resourceDef.quality,
      },
      keywords: resourceKey,
      id: 1
    });
  }

  static getRecipes() {
    return _loadedRecipes;
  }
}

module.exports = Crafting;
