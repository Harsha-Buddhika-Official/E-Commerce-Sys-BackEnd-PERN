import pool from "../../config/db.js";

//using
export const createBanner = async (data) => {
    const query = `
        INSERT INTO banners (
            media_type,
            media_url,
            title,
            media_public_id
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *;
    `;

    const values = [
        data.media_type,
        data.media_url,
        data.title,
        data.media_public_id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//using
export const getAllBanners = async () => {
    const query = `
        SELECT *
        FROM banners
    `;

    const { rows } = await pool.query(query);
    return rows;
};

//using
export const getBannerImages = async () => {
    const query = `
        SELECT media_url
        FROM banners
        WHERE media_type = 'image'
        ORDER BY banner_id DESC
        LIMIT 5;
    `;
    const { rows } = await pool.query(query);
    return rows;
}

//using
export const getBannerVideo = async () => {
    const query = `
        SELECT media_url
        FROM banners
        WHERE media_type = 'video'
    `;
    const { rows } = await pool.query(query);
    return rows;
}

//using
export const getBannerById = async (bannerId) => {
    const query = `
        SELECT *
        FROM banners
        WHERE banner_id = $1;
    `;

    const { rows } = await pool.query(query, [bannerId]);
    return rows[0];
};

export const updateBanner = async (bannerId, data) => {
    const query = `
        UPDATE banners
        SET
            media_type = COALESCE($2, media_type),
            media_url = COALESCE($3, media_url),
            title = COALESCE($4, title),
            is_active = COALESCE($5, is_active),
            sort_order = COALESCE($6, sort_order),
            updated_at = NOW()
        WHERE banner_id = $1
        RETURNING *;
    `;

    const values = [
        bannerId,
        data.media_type,
        data.media_url,
        data.title,
        data.is_active,
        data.sort_order
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//using
export const deleteBanner = async (bannerId) => {
    const query = `
        DELETE FROM banners
        WHERE banner_id = $1
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [bannerId]);
    return rows[0];
};