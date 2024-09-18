import asyncHandler from "express-async-handler";
import { MoviesData } from "../Data/MovieData.js";
import Movie from "../Models/MoviesModel.js";

// ************PUBLIC CONTROLLERS******************
// @desc import movies
// @route POST /api/movies/import
// @access Public

const importMovies = asyncHandler(async (req, res) => {
    // first we make sure our Movies table is empty by delete all document 
    await Movie.deleteMany({});
    // then we insert all movies from MoviesData
    const movies = await Movie.insertMany(MoviesData);
    res.status(201).json(movies);
});

// @desc get all movies
// @route GET /api/movies
// @access Public

const getMovies = asyncHandler(async (req, res) => {
    try {
      // filter movies by category, time, language, rate, year and search
      const { category, time, language, rate, year, search} = req.body;
      let query = {
        ...(category && { category }),
        ...(time && { time }),
        ...(language && { language }),
        ...(rate && { rate }),
        ...(year && { year }),
        ...(search && { title: { $regex: search, $options: "i" } }),
      }

      // load more movies functionality
      const page = Number(req.query.pageNumber) || 1; // if pageNumber is not provided in query we set it to 1
      const limit = 2; // 2 movies per page
      const skip = (page -1) * limit; // skip 2 movies per page

      // find movies by query, skpip and limit

      const movies = await Movie.find(query)
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit);
      
      // get total number of movies
      const count = await Movie.countDocuments(query);

      // send response with movies and total number of movies
      res.json({
        movies,
        page,
        pages: Math.ceil(count / limit), // total number of pages
        totalMovies: count, // total number of movies
      });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

export { importMovies, getMovies };