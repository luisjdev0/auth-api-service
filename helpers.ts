import mysql from 'mysql2/promise'

export const query = async (sql: string, params?: Array<any>) => {
    try{
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME
        })
        const data = (await connection.execute(sql, params))[0]
        connection.end()
        return data
    }catch (e : any){
        throw `Error de DB: (${e.message}})`
    }
}