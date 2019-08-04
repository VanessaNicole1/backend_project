/*===================================
PUERTO
=====================================*/
process.env.PORT = process.env.PORT || 3000;

/*===================================
Roles
=====================================*/
process.env.MED_ROLE = "MED_ROLE";
process.env.ADMIN_ROLE = "ADMIN_ROLE";
process.env.USER_ROLE = "USER_ROLE";


/*===================================
Seed
=====================================*/
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

/*===================================
Expiration Token
=====================================*/
process.env.EXPIRES = 60 * 60 * 24 *30;