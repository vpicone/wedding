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

const PROJECT_NAME = 'Wedding';

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

const ACTIVE_USER_AND_ADMIN = ({ existingItem, authentication }) =>
  authentication.item.isAdmin || existingItem.id === authentication.item.id;
const ADMIN = ({ authentication }) => authentication.item.isAdmin;

keystone.createList('User', {
  access: ACTIVE_USER_AND_ADMIN,
  fields: {
    name: { type: Text, isRequired: true },
    email: {
      type: Text,
    },
    address: { type: Location, googleMapsKey: process.env.GOOGLE_BROWSER_KEY },
    isAdmin: {
      type: Checkbox,
      access: ADMIN,
    },
    plusOne: { type: Checkbox },
    password: {
      type: Password,
    },
    vegan: { type: Checkbox },
    status: {
      type: Select,
      options: 'Declined, Accepted',
    },
    gift: {
      type: Select,
      options: 'Registry, Cash',
      access: ADMIN,
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
  apps: [
    new GraphQLApp(),
    new AdminUIApp({ authStrategy }),
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
