# Dawaj, robimy z tego questa

This is a simple web app allows for adding time-based tasks.

## Raison d'etre

I wanted to create an interactive task list for myself that allows me to specify a time limit
for each task and allows for only one active task at the time. I imagine that by gamifying
the everyday process of tracking what needs to be done in a day I could rawdog my ADHD better.

The other reason for this project's existence is rather simple. I wanted to write something
from the ground-up in Svelte 5. Before creating this app I only transitioned one project from
Svelte 4 to 5 and the new reactive programming paradigms introduced in 5 are really fun
to play around with.

## Features

- Specify a quest with time budget;
- Single click on a quest selects it. Selected quest can be edited or activated;
- By activating the quest a timer is started;
- The quest can be marked as completed before or after the time runs out;
- There are user accounts. Quests are synced between session of a single user.

## TODO

- [x] Login page frontend;
- [x] Database for user data, quest info and session token lookup;
- [x] Authorization API;
- [ ] Quest creation, start and modification endpoints;
- [ ] Some broadcast service which will use SSE to notify all connected clients for current user about changes to the task list;
- [ ] Quest list;
- [ ] Quest add / modify dialog boxes.

## Database initalization

Running MySQL without setting it up as a service on MacOS

```bash
/opt/homebrew/opt/mysql/bin/mysqld_safe --datadir\=/opt/homebrew/var/mysql
```

```sql
CREATE DATABASE quests;
USE quests;
CREATE TABLE users (email VARCHAR(256) NOT NULL PRIMARY KEY, password VARCHAR(256) NOT NULL);
CREATE TABLE tokens (user VARCHAR(256) NOT NULL, value VARCHAR(36) NOT NULL PRIMARY KEY, exp_date DATETIME NOT NULL);
CREATE USER 'svelte'@'localhost' IDENTIFIED BY 'password' DEFAULT ROLE application;
GRANT ALL PRIVILEGES ON quests.* TO 'svelte'@'localhost';
```
