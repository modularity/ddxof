/*
    This file houses the realm configurations need to facilitate app storage.
    Schemas: Post, Category, Tag, Timestamp, Favorite
    If changes need to made to this structure, be sure to increment the schemaVersion and review all realm use in the app.
*/
import Realm from 'realm';

class Post extends Realm.Object {}
Post.schema = {
  name: 'Post',
  properties: {
    id: 'int',
    title: 'string',
    date: 'date',
    modified: 'date',
    categories: {type: 'list', objectType: 'Category'},
    tags: {type: 'list', objectType: 'Tag'},
    algCount: 'int',
    algorithm_url: 'string',
    algorithm_url2: 'string',
    algorithm_url3: 'string',
    algorithm_url4: 'string',
    algorithm_url5: 'string',
    algorithm_url6: 'string',
  }
}

class Category extends Realm.Object {}
Category.schema = {
  name: 'Category',
  properties: {
    id: 'int',
    name: 'string',
    count: 'int',
    parent: 'int',
  }
}

class Tag extends Realm.Object {}
Tag.schema = {
  name: 'Tag',
  properties: {
    id: 'int',
    name: 'string',
    count: 'int',
  }
}

class Timestamp extends Realm.Object {}
Timestamp.schema = {
  name: 'Timestamp',
  properties: {
    date: 'date',
  }
}

class Favorite extends Realm.Object {}
Favorite.schema = {
  name: 'Favorite',
  properties: {
    id: 'int',
    posts: {type: 'Post'},
    algorithm_url: {type: 'data', optional: true},
    algorithm_url2: {type: 'data', optional: true},
    algorithm_url3: {type: 'data', optional: true},
    algorithm_url4: {type: 'data', optional: true},
    algorithm_url5: {type: 'data', optional: true},
    algorithm_url6: {type: 'data', optional: true},
  }
}

export default new Realm({schema: [Post, Category, Tag, Timestamp, Favorite], schemaVersion: 1})
