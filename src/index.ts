import axios from 'axios';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import readline from 'readline';

dotenv.config();

interface User {
  username: string;
  location: string;
  languages: string[];
}

interface Database {
  insertUser(user: User): Promise<void>;
  listUsers(): Promise<void>;
  listUsersByLocation(location: string): Promise<void>;
  listUsersByLanguage(language: string): Promise<void>;
}

// Get user info from GitHub API
async function getUser(username: string) {
  try {
    const userResponse = await axios.get(`https://api.github.com/users/${username}`);
    const name = userResponse.data.login;
    const location = userResponse.data.location;
    const repoResponse = await axios.get(`https://api.github.com/users/${username}/repos`);
    const languages: string[] = repoResponse.data.reduce((languages: string[], repo: any) => {
      if (repo.language && !languages.includes(repo.language)) {
        languages.push(repo.language);
      }
      return languages;
    }, []);

    return {
      username: name,
      location: location,
      languages: languages,
    };
  } catch (error: any) {
    throw new Error(`Error getting user '${username}' from GitHub API: ${error.message}`);
  }
}

function displayMenu() {
  console.log('=== User Menu ===');
  console.log('1. Run \x1b[32madd-user <username>\x1b[0m to add a user to the database.');
  console.log('2. Run \x1b[32mlist-users\x1b[0m to get all users in the database.');
  console.log('3. Run \x1b[32mlist-location <location>\x1b[0m to get all users from a given location.');
  console.log('4. Run \x1b[32mlist-languages <language>\x1b[0m to get all users from a given language.');
  console.log('5. Run exit to close the application.');
  console.log('=================');
}

function displayUser(user: User) {
  console.log(`Username: ${user.username}`);
  console.log(`Location: ${user.location}`);
  console.log(`Languages: ${user.languages}`);
  console.log('=================');
}

async function insertUserToDB(pool: Pool, user: User) {
  try {
    await pool.query('INSERT INTO users (username, location, languages) VALUES ($1, $2, $3)', [
      user.username, 
      user.location, 
      user.languages
    ]);
    console.log('User inserted into the database sucessfully.');
    console.log(`Username: ${user.username}\nLocation: ${user.location}\nLanguages: ${user.languages}`);
  } catch (error: any) {
    throw new Error(`Error inserting user into the database: ${error.message}`);
  }
}

async function listUsersFromDB(pool: Pool) {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    rows.forEach((user: User) => {
      displayUser(user);
    });
  } catch (error: any) {
    throw new Error(`Error listing users from the database: ${error.message}`);
  }
}

async function listUsersByLocationFromDB(pool: Pool, location: string) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE location ILIKE $1', [`%${location}%`]);
    if (rows.length === 0) {
      console.log(`No users found from location: ${location}`);
    } else {
      rows.forEach((user: User) => {
        displayUser(user);
      });
    }
  } catch (error: any) {
    throw new Error(`Error listing users by location from the database: ${error.message}`);
  }
}

async function listUsersByLanguageFromDB(pool: Pool, language: string) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE languages ILIKE $1', [`%${language}%`]);
    if (rows.length === 0) {
      console.log(`No users found for language: ${language}`);
    } else {
      rows.forEach((user: User) => {
        displayUser(user);
      });
    }
  } catch (error: any) {
    throw new Error(`Error listing users by location from the database: ${error.message}`);
  }
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  displayMenu();
 
  const handleMenuChoice = async (choice: string, db: Database) => {
    const [command, filter] = choice.split(' ');
    
    switch (command) {
      case 'add-user':
        if (filter) {
          try {
            const user = await getUser(filter);
            await db.insertUser(user);
          } catch (error: any) {
            throw new Error(`${error.message}`);
          }
        } else {
          console.error('Invalid command. Please provide a username.');
        }
        rl.prompt();
        break;
      case 'list-users':
        await db.listUsers();
        rl.prompt();
        break;
      case 'list-location':
        if (filter) {
          try {
            await db.listUsersByLocation(filter);
          } catch (error: any) {
            throw new Error(`${error.message}`);
          }
        } else {
          console.log('Invalid command. Please provide a location.');
        }
        rl.prompt();
        break;
      case 'list-languages':
        if (filter) {
          try {
            await db.listUsersByLanguage(filter);
          } catch (error: any) {
            throw new Error(`${error.message}`);
          }
        } else {
          console.error('Invalid command. Please provide a language.');
        }
        rl.prompt();
        break;
      case 'exit':
        console.error('Closing the application...');
        rl.close();
        break;
      default:
        console.error('Invalid choice. Please try again.');
        rl.prompt();
        break;
    }
  };

  rl.prompt();
  rl.on('line', (line: string) => {
    const input = line.trim();
    handleMenuChoice(input, {
      insertUser: (user: User) => insertUserToDB(pool, user),
      listUsers: () => listUsersFromDB(pool),
      listUsersByLocation: (location: string) => listUsersByLocationFromDB(pool, location),
      listUsersByLanguage: (language: string) => listUsersByLanguageFromDB(pool, language),
    });
  });

}

main();