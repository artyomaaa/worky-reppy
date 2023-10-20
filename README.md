# Worky-Reppy Project

## Local Setup
### Backend part
- copy .env.example to .env file, make your environment changes 
- composer install
- php artisan migrate:fresh --seed
- php artisan passport:install
- copy generated codes into .env file, example:
```
PERSONAL_CLIENT_ID=1
PERSONAL_CLIENT_SECRET=L0v1NqKp9ItuB6R2n5GEgg0FjkYPy3tg9K3pmORZ
PASSWORD_CLIENT_ID=2
PASSWORD_CLIENT_SECRET=gX0kya9Br2hXVQskXFEKr7BcrmtlLSLGU7pOClUy
```
Note: Sometimes we need to clear caches
- php artisan route:clear
- php artisan config:clear

Here we have used laravel-permission package
More documentation here: https://docs.spatie.be/laravel-permission/v3/

- php artisan permission:cache-reset

Run command ```crontab -e``` open with text editor and add following line at the end of the file

```* * * * * php /var/www/worky-reppy/artisan stop:AllWorks >> /dev/null 2>&1```

### Frontend Part
- copy ../frontend/src/utils/config.example.js to ../frontend/src/utils/config.js , make your environment changes 
- cd frontend
- npm install
- npm start

### Advanced Settings
If after initialization the project doesn't work,
we have to connect the `rewrite` module to the apache if it's not connected.

- `sudo a2enmod rewrite `
- `sudo service apache2 restart`

Often we need to open permissions for `root`

- `sudo chown -R developer:www-data /var/www/worky-reppy/`
- `sudo chmod -R g+rwX /var/www/worky-reppy/`

and `./storage` folders

- `sudo chown -R developer:www-data ./storage`
- `sudo chmod -R g+rwX ./storage`


### Rollbar.com logs
The **.env** should have two params _(please use **own token** for local development)_
* ROLLBAR_TOKEN=7ddf2356c77f41808962aa68bca9a5cc
* ROLLBAR_LEVEL=debug

## Updating Live
Before `npm run build` add correct `appVersion` in **frontend/src/utils/config.js** file
