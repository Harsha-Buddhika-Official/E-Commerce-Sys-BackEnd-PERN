import pool from "../../config/db.js";

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

export const getAllBanners = async () => {
    const query = `
        SELECT *
        FROM banners
    `;

    const { rows } = await pool.query(query);
    return rows;
};

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

export const getBannerVideo = async () => {
    const query = `
        SELECT media_url
        FROM banners
        WHERE media_type = 'video'
    `;
    const { rows } = await pool.query(query);
    return rows;
}

export const getBannerById = async (bannerId) => {
    const query = `
        SELECT *
        FROM banners
        WHERE banner_id = $1;
    `;

    const { rows } = await pool.query(query, [bannerId]);
    return rows[0];
};

export const deleteBanner = async (bannerId) => {
    const query = `
        DELETE FROM banners
        WHERE banner_id = $1
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [bannerId]);
    return rows[0];
};