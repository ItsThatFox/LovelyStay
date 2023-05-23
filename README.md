# Lovelystay.com | Back-End Coding Test
This is an "emulated" command-line application that allows you to fetch GitHub users and store their information in a PostgreSQL database. You can add users, list all users, filter users by location and filter users by programming language.

## Setup

### Prerequisites

- Node.js
- PostgreSQL (installed and running)

### Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/your-username/github-user-management.git

2. Navigate to the project directory:
   ```shell
    cd github-user-management

3. Install dependencies:
    ```shell
    npm i

4. Set up environment variables:
    
    Create a <b>.env</b> file in the project root directory.
    
    Add the following variable to the .env file:
    
    <b>DATABASE_URL=postgres://user:password@localhost:5432/db</b>
    
    Don't forget to replace the placeholder values for the user, password and db with your own.

5. Run the migration to create the necessary database tables:
    ```shell
    npm run migrate up
    
## Usage

1. Start the application by running the following command:
    ```shell
    npm run start

2. Use the menu provided to guide you through the available commands.
    
    To add a user to the database, type <b>add-user username</b>, replacing <b>username</b> with the GitHub username of the user you want to add.

    To list all users in the database, type <b>list-users</b>.

    To list users from a specific location, type <b>list-location location</b>, replacing <b>location</b> with the desired location.

    To list users who use a specific programming language, type <b>list-languages language</b>, replacing <b>language</b> with the desired programming language.

    To exit the application, type <b>exit</b>.