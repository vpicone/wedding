require('dotenv').config();

const { Keystone } = require('@keystonejs/keystone');
const {
  Text,
  Password,
  Checkbox,
  Select,
  Location,
} = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { NextApp } = require('@keystonejs/app-next');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { byTracking } = require('@keystonejs/list-plugins');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const { distDir } = require('./config');

const PROJECT_NAME = 'keystone';

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter({
    mongoUri: process.env.CUSTOMCONNSTR_MONGO_URI || '',
  }),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text, isRequired: true },
    email: {
      type: Text,
    },
    address: { type: Location, googleMapsKey: process.env.GOOGLE_BROWSER_KEY },
    isAdmin: { type: Checkbox },
    plusOne: { type: Checkbox },
    password: { type: Password },
    status: {
      type: Select,
      options: 'Pending, Declined, Accepted',
      defaultValue: 'Pending',
    },
  },
  labelResolver: item => `${item.name + (item.plusOne ? ' +1' : '')}`,
  plugins: [byTracking()],
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username', // default: 'email'
    secretField: 'password', // default: 'password'
  },
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({}), new NextApp({ dir: 'app' })],
  distDir,
};
