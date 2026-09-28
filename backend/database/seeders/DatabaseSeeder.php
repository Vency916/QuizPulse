<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\AnswerOption;
use App\Models\QuizSession;
use App\Models\Group;
use App\Models\Participant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@quizpulse.com'],
            [
                'name' => 'QuizPulse Super Admin',
                'password' => Hash::make('password123'),
                'is_super_admin' => true,
            ]
        );

        // 2. Create Quiz 1: Galactic Science Quest
        $quiz1 = Quiz::firstOrCreate(
            ['slug' => 'galactic-science-quest'],
            [
                'title' => 'Galactic Science Quest',
                'description' => 'Embark on an epic journey through cosmic wonders, planetary secrets, and the fundamental laws of physics!',
                'category' => 'Science',
                'difficulty' => 'medium',
                'cover_image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'settings' => [
                    'speed_bonus' => true,
                    'base_points' => 100,
                    'max_speed_bonus' => 400,
                    'negative_points' => false,
                    'groups_enabled' => true,
                ],
                'created_by' => $admin->id,
            ]
        );

        if ($quiz1->questions()->count() === 0) {
            // Q1: MCQ
            $q1 = Question::create([
                'quiz_id' => $quiz1->id,
                'type' => 'multiple_choice',
                'question_text' => 'Which planet in our solar system has the most prominent and extensive ring system?',
                'time_limit' => 20,
                'points' => 100,
                'order' => 1,
                'explanation' => 'Saturn has the most spectacular and extensive ring system, made of countless chunks of ice and rock.',
            ]);
            AnswerOption::create(['question_id' => $q1->id, 'option_text' => 'Jupiter', 'is_correct' => false, 'order' => 1]);
            AnswerOption::create(['question_id' => $q1->id, 'option_text' => 'Saturn', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $q1->id, 'option_text' => 'Neptune', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $q1->id, 'option_text' => 'Uranus', 'is_correct' => false, 'order' => 4]);

            // Q2: True / False
            $q2 = Question::create([
                'quiz_id' => $quiz1->id,
                'type' => 'true_false',
                'question_text' => 'Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth.',
                'time_limit' => 15,
                'points' => 100,
                'order' => 2,
                'explanation' => 'Travelling at 300,000 km/s, photons take roughly 8 minutes and 20 seconds to cross the 150 million km distance.',
            ]);
            AnswerOption::create(['question_id' => $q2->id, 'option_text' => 'True', 'is_correct' => true, 'order' => 1]);
            AnswerOption::create(['question_id' => $q2->id, 'option_text' => 'False', 'is_correct' => false, 'order' => 2]);

            // Q3: Multiple Select
            $q3 = Question::create([
                'quiz_id' => $quiz1->id,
                'type' => 'multiple_select',
                'question_text' => 'Which of the following are inner terrestrial (rocky) planets? (Select all that apply)',
                'time_limit' => 25,
                'points' => 150,
                'order' => 3,
                'explanation' => 'Mercury, Venus, Earth, and Mars are the four rocky inner planets. Jupiter and Neptune are gas/ice giants.',
            ]);
            AnswerOption::create(['question_id' => $q3->id, 'option_text' => 'Mars', 'is_correct' => true, 'order' => 1]);
            AnswerOption::create(['question_id' => $q3->id, 'option_text' => 'Venus', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $q3->id, 'option_text' => 'Jupiter', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $q3->id, 'option_text' => 'Neptune', 'is_correct' => false, 'order' => 4]);

            // Q4: Short Answer
            $q4 = Question::create([
                'quiz_id' => $quiz1->id,
                'type' => 'short_answer',
                'question_text' => 'What is the chemical symbol for the gas that humans breathe in to survive (Oxygen)?',
                'time_limit' => 15,
                'points' => 100,
                'order' => 4,
                'explanation' => 'O or O2 is the standard chemical designation for oxygen gas.',
            ]);
            AnswerOption::create(['question_id' => $q4->id, 'option_text' => 'O', 'is_correct' => true, 'order' => 1]);
            AnswerOption::create(['question_id' => $q4->id, 'option_text' => 'O2', 'is_correct' => true, 'order' => 2]);

            // Q5: MCQ
            $q5 = Question::create([
                'quiz_id' => $quiz1->id,
                'type' => 'multiple_choice',
                'question_text' => 'What force keeps planets orbiting around the Sun?',
                'time_limit' => 20,
                'points' => 100,
                'order' => 5,
                'explanation' => 'Gravitational attraction between the massive Sun and orbiting planets maintains their orbits.',
            ]);
            AnswerOption::create(['question_id' => $q5->id, 'option_text' => 'Electromagnetism', 'is_correct' => false, 'order' => 1]);
            AnswerOption::create(['question_id' => $q5->id, 'option_text' => 'Gravity', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $q5->id, 'option_text' => 'Centrifugal Repulsion', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $q5->id, 'option_text' => 'Solar Wind', 'is_correct' => false, 'order' => 4]);
        }

        // 3. Create Quiz 2: Global Geography & Landmarks
        $quiz2 = Quiz::firstOrCreate(
            ['slug' => 'global-geography-and-landmarks'],
            [
                'title' => 'Global Geography & Wonders',
                'description' => 'Test your knowledge on world capitals, breathtaking landmarks, oceans, and continents.',
                'category' => 'Geography',
                'difficulty' => 'easy',
                'cover_image' => 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'settings' => [
                    'speed_bonus' => true,
                    'base_points' => 100,
                    'max_speed_bonus' => 300,
                    'negative_points' => false,
                    'groups_enabled' => true,
                ],
                'created_by' => $admin->id,
            ]
        );

        if ($quiz2->questions()->count() === 0) {
            $g1 = Question::create([
                'quiz_id' => $quiz2->id,
                'type' => 'multiple_choice',
                'question_text' => 'What is the capital city of Nigeria?',
                'time_limit' => 15,
                'points' => 100,
                'order' => 1,
                'explanation' => 'Abuja replaced Lagos as Nigeria’s federal capital territory in December 1991.',
            ]);
            AnswerOption::create(['question_id' => $g1->id, 'option_text' => 'Lagos', 'is_correct' => false, 'order' => 1]);
            AnswerOption::create(['question_id' => $g1->id, 'option_text' => 'Abuja', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $g1->id, 'option_text' => 'Kano', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $g1->id, 'option_text' => 'Ibadan', 'is_correct' => false, 'order' => 4]);

            $g2 = Question::create([
                'quiz_id' => $quiz2->id,
                'type' => 'multiple_choice',
                'question_text' => 'Which is the largest ocean on planet Earth?',
                'time_limit' => 15,
                'points' => 100,
                'order' => 2,
                'explanation' => 'The Pacific Ocean covers more than 30% of the Earth’s surface area.',
            ]);
            AnswerOption::create(['question_id' => $g2->id, 'option_text' => 'Atlantic Ocean', 'is_correct' => false, 'order' => 1]);
            AnswerOption::create(['question_id' => $g2->id, 'option_text' => 'Pacific Ocean', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $g2->id, 'option_text' => 'Indian Ocean', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $g2->id, 'option_text' => 'Arctic Ocean', 'is_correct' => false, 'order' => 4]);

            $g3 = Question::create([
                'quiz_id' => $quiz2->id,
                'type' => 'true_false',
                'question_text' => 'Mount Kilimanjaro is the highest free-standing mountain in the world.',
                'time_limit' => 15,
                'points' => 100,
                'order' => 3,
                'explanation' => 'Kilimanjaro in Tanzania rises 5,895 meters above sea level without being part of a mountain range.',
            ]);
            AnswerOption::create(['question_id' => $g3->id, 'option_text' => 'True', 'is_correct' => true, 'order' => 1]);
            AnswerOption::create(['question_id' => $g3->id, 'option_text' => 'False', 'is_correct' => false, 'order' => 2]);
        }

        // 4. Create Quiz 3: Tech Trivia & Code Champions
        $quiz3 = Quiz::firstOrCreate(
            ['slug' => 'tech-trivia-and-code-champions'],
            [
                'title' => 'Tech Trivia & Coding Champions',
                'description' => 'From binary logic to internet history and modern programming legends!',
                'category' => 'Technology',
                'difficulty' => 'hard',
                'cover_image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                'status' => 'published',
                'settings' => [
                    'speed_bonus' => true,
                    'base_points' => 120,
                    'max_speed_bonus' => 500,
                    'negative_points' => false,
                    'groups_enabled' => false,
                ],
                'created_by' => $admin->id,
            ]
        );

        if ($quiz3->questions()->count() === 0) {
            $t1 = Question::create([
                'quiz_id' => $quiz3->id,
                'type' => 'multiple_choice',
                'question_text' => 'Who is recognized as the world’s first computer programmer for working on Babbage’s Analytical Engine?',
                'time_limit' => 20,
                'points' => 120,
                'order' => 1,
                'explanation' => 'Ada Lovelace wrote the first algorithm intended to be carried out by a machine in 1843.',
            ]);
            AnswerOption::create(['question_id' => $t1->id, 'option_text' => 'Grace Hopper', 'is_correct' => false, 'order' => 1]);
            AnswerOption::create(['question_id' => $t1->id, 'option_text' => 'Ada Lovelace', 'is_correct' => true, 'order' => 2]);
            AnswerOption::create(['question_id' => $t1->id, 'option_text' => 'Alan Turing', 'is_correct' => false, 'order' => 3]);
            AnswerOption::create(['question_id' => $t1->id, 'option_text' => 'Margaret Hamilton', 'is_correct' => false, 'order' => 4]);
        }

        // 5. Create an initial Live Session for demonstration
        $demoSession = QuizSession::firstOrCreate(
            ['session_code' => 'QP2026'],
            [
                'quiz_id' => $quiz1->id,
                'status' => 'waiting',
                'settings' => [
                    'groups_enabled' => true,
                    'speed_bonus' => true,
                    'auto_assign_groups' => false,
                ],
            ]
        );

        // Create Demo Groups
        $teamBlue = Group::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'name' => 'Team Blue'],
            ['color' => '#0984E3', 'score' => 2450]
        );
        $teamRed = Group::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'name' => 'Team Red'],
            ['color' => '#FF7675', 'score' => 2180]
        );
        $teamGreen = Group::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'name' => 'Team Green'],
            ['color' => '#00B894', 'score' => 1890]
        );

        // Create Demo Participants
        Participant::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'username' => 'Victory'],
            [
                'group_id' => $teamBlue->id,
                'session_token' => Str::random(32),
                'score' => 1250,
                'correct_answers' => 2,
                'status' => 'waiting',
            ]
        );
        Participant::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'username' => 'Daniel'],
            [
                'group_id' => $teamRed->id,
                'session_token' => Str::random(32),
                'score' => 1180,
                'correct_answers' => 2,
                'status' => 'waiting',
            ]
        );
        Participant::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'username' => 'Ada'],
            [
                'group_id' => $teamBlue->id,
                'session_token' => Str::random(32),
                'score' => 1090,
                'correct_answers' => 2,
                'status' => 'waiting',
            ]
        );
        Participant::firstOrCreate(
            ['quiz_session_id' => $demoSession->id, 'username' => 'Chris'],
            [
                'group_id' => $teamGreen->id,
                'session_token' => Str::random(32),
                'score' => 980,
                'correct_answers' => 1,
                'status' => 'waiting',
            ]
        );
    }
}
