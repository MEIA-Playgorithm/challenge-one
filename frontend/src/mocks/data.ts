import { usersFromCsv } from "../lib/userKb";

/** genre/2 values from the movie catalog, with whitespace collapsed the way the loader does. */
export const GENRES = [
  "Action",
  "Action Epic",
  "Adult Animation",
  "Adventure",
  "Adventure Epic",
  "Animation",
  "Anime",
  "Biography",
  "Buddy Comedy",
  "Comedy",
  "ComingofAge",
  "Computer Animation",
  "Cop Drama",
  "Crime",
  "Cyberpunk",
  "Dark Comedy",
  "Documentary",
  "Drama",
  "Epic",
  "Family",
  "Fantasy",
  "Globetrotting Adventure",
  "HandDrawn Animation",
  "Heist",
  "HighConcept Comedy",
  "History",
  "Holiday",
  "Holiday Family",
  "Horror",
  "Jungle Adventure",
  "Kaiju",
  "Legal Drama",
  "Mockumentary",
  "Music",
  "Musical",
  "Mystery",
  "OnePerson Army Action",
  "Parody",
  "Period Drama",
  "Psychological Drama",
  "Psychological Horror",
  "Psychological Thriller",
  "Quest",
  "Road Trip",
  "Romance",
  "Romantic Comedy",
  "Romantic Epic",
  "Satire",
  "SciFi",
  "SciFi Epic",
  "Sea Adventure",
  "Slapstick",
  "Slasher Horror",
  "Splatter Horror",
  "Sport",
  "Superhero",
  "Supernatural Fantasy",
  "Suspense Mystery",
  "Swashbuckler",
  "Sword Sandal",
  "Thriller",
  "Tragedy",
  "True Crime",
  "War",
  "Western",
  "Wuxia",
];

/** language/2 values from the movie catalog. */
export const LANGUAGES = [
  "Arabic",
  "Cantonese",
  "Czech",
  "Danish",
  "English",
  "French",
  "German",
  "Hebrew",
  "Hindi",
  "Italian",
  "Japanese",
  "Korean",
  "Latin",
  "Mandarin",
  "Persian",
  "Portuguese",
  "Russian",
  "Sinhala",
  "Sioux",
  "Soninke",
  "Spanish",
  "Swedish",
  "Tamil",
  "Tupi",
  "Turkish",
  "Urdu",
  "Wolof",
];

/** Same rows as swi-prolog/knowledge_base_users.csv. */
const USERS_CSV = `user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,preferred_directors,preferred_writers,preferred_stars,preferred_countries,preferred_subgenres,preferred_pace,preferred_complexity,preferred_violence,preferred_humor,preferred_psychological_intensity,preferred_emotional_tones,preferred_themes,preferred_audience,preferred_eras,preferred_popularity,max_duration_minutes,year_from,year_to,required_languages,disliked_directors,disliked_stars,session_min_age,min_rating,rating_tolerance,rating_required,allow_rewatch
ana,25,tt0087469=4|tt7798634=1,tt0372784,Action|Adventure,Horror,English,Japanese,Christopher Nolan,Bob Kane,Christian Bale,United States,Action Epic,fast,medium,medium,medium,medium,exciting,justice|exploration,mainstream,modern,very_popular,150,2000,2026,English,Alfred Hitchcock,Anthony Perkins,25,8,0,true,false
bruno,32,tt7798634=0,tt0054215,Horror|Mystery|Thriller,Musical,English,Japanese,Alfred Hitchcock,Joseph Stefano,Anthony Perkins,United States,Psychological Horror,fast,high,high,low,high,dark|tense,psychology|crime,mainstream,modern,popular,130,2000,2026,English,Shirish Kunder,Akshay Kumar,32,8,0,true,false
carla,29,tt0456481=0|tt0372784=1|tt7798634=5,tt1583420,Comedy|Romance,Horror|War,English|French,Japanese,Tom Hanks,Tom Hanks,Tom Hanks,United States,Romantic Comedy,medium,low|medium,low,high,low,lighthearted|romantic,love,niche,modern,less_popular,120,2000,2019,English|French,Alfred Hitchcock,Anthony Perkins,29,6.5,0.5,false,false
diogo,12,tt0087469=0,tt2510894,Animation|Family|Fantasy,Horror,English,Japanese,Genndy Tartakovsky,Robert Smigel,Adam Sandler,United States,Computer Animation,medium|fast,low,low,high,low,lighthearted,family|supernatural,niche,modern,less_popular,100,2000,2026,English,Alfred Hitchcock,Anthony Perkins,12,7,0.5,false,false
eva,41,tt0067961=0,tt1360860,Drama|Mystery,Slapstick,Persian|French|English,Japanese,Asghar Farhadi,Asghar Farhadi,Taraneh Alidoosti,Iran,Psychological Drama,slow,high,low|medium,low,high,reflective|sad,psychology|growing_up,niche,classic|recent,less_popular,150,1990,2026,Persian|French|English,John Sturges,Burt Lancaster,41,8,0.5,false,false
filipe,35,tt0372784=0,tt15097216,Crime|Drama,Horror,Tamil|English,Japanese,TJ Gnanavel,TJ Gnanavel,Suriya,India,Legal Drama,medium,high,medium,low,medium|high,reflective|tense,justice|crime,niche,modern,less_popular,180,2000,2019,Tamil|English,Alfred Hitchcock,Anthony Perkins,35,8,0,true,false
ines,19,tt2510894=0,tt0870154,Adventure|Fantasy|Comedy,Horror,English|Portuguese,Japanese,Jaume ColletSerra,Michael Green,Dwayne Johnson,United States,HighConcept Comedy,fast,medium,medium,high,medium,exciting|lighthearted,exploration|supernatural,niche,modern,less_popular,140,2000,2019,English|Portuguese,Alfred Hitchcock,Anthony Perkins,19,7,0.5,false,false
joao,58,tt0082247=3,tt0065150,Western|Adventure|War,Horror,English|Spanish,Japanese,Andrew V McLaglen,James Lee Barrett,John Wayne,United States,Wuxia,fast|medium,medium,high,low,medium,exciting|romantic,war|love,niche,classic|modern,less_popular,150,1990,2019,English|Spanish,Alfred Hitchcock,Anthony Perkins,58,6.5,0,true,false
mariana,22,tt5883570=0,tt0105793,Comedy|Music|Musical,Horror,English|Hindi,German,Penelope Spheeris,Mike Myers,Mike Myers,United States,Buddy Comedy,medium,low|medium,low,high,low,lighthearted,music,niche,recent,less_popular,120,2020,2026,English|Hindi,Alfred Hitchcock,Anthony Perkins,22,7,0,true,false
tiago,46,tt0062639=0,tt0064451,Action|Thriller|Drama,Musical,Mandarin|French,English,King Hu,Songling Pu,Feng Hsu,Taiwan,Wuxia,fast,medium|high,medium,low,medium|high,tense|reflective,exploration|psychology,niche,modern,less_popular,210,2000,2019,Mandarin|French,Shirish Kunder,Akshay Kumar,46,7.5,0,true,false
`;

export const MOCK_USERS = usersFromCsv(USERS_CSV);
