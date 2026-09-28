<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\AnswerOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::create([
            'name' => 'QuizPulse Super Admin',
            'email' => 'admin@quizpulse.com',
            'password' => bcrypt('password123'),
            'is_super_admin' => true,
        ]);

        $quiz = Quiz::updateOrCreate(
            ['slug' => 'brain-sparks-trivia-challenge'],
            [
                'title' => 'Brain Sparks: Speed Trivia Challenge',
                'description' => 'Fast, thrilling quiz featuring science wonders, gaming lore, animals, and geography riddles!',
                'category' => 'Science & Trivia',
                'difficulty' => 'medium',
                'cover_image' => 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
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

        // Delete old questions if re-seeding
        $quiz->questions()->delete();

        $questions = [
            [
                'order' => 1,
                'type' => 'multiple_choice',
                'text' => 'What is the closest planet to the Sun in our Solar System?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Mercury is the smallest planet and closest to the Sun!',
                'options' => [
                    ['text' => 'Venus', 'correct' => false],
                    ['text' => 'Mercury', 'correct' => true],
                    ['text' => 'Mars', 'correct' => false],
                    ['text' => 'Earth', 'correct' => false],
                ],
            ],
            [
                'order' => 2,
                'type' => 'true_false',
                'text' => 'Lightning never strikes the same place twice.',
                'time_limit' => 15,
                'points' => 100,
                'explanation' => 'False! Lightning frequently strikes the same place repeatedly, especially tall structures like the Empire State Building.',
                'options' => [
                    ['text' => 'True', 'correct' => false],
                    ['text' => 'False', 'correct' => true],
                ],
            ],
            [
                'order' => 3,
                'type' => 'multiple_choice',
                'text' => 'Which animal is known to have the highest blood pressure in the world?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Giraffes have immense blood pressure (about double a human) to pump blood up their long necks to their brain!',
                'options' => [
                    ['text' => 'Elephant', 'correct' => false],
                    ['text' => 'Blue Whale', 'correct' => false],
                    ['text' => 'Giraffe', 'correct' => true],
                    ['text' => 'Hippopotamus', 'correct' => false],
                ],
            ],
            [
                'order' => 4,
                'type' => 'multiple_select',
                'text' => 'Which of the following elements are Noble Gases? (Select all that apply)',
                'time_limit' => 25,
                'points' => 150,
                'explanation' => 'Helium, Neon, and Argon are Noble Gases (Group 18). Oxygen is a reactive nonmetal.',
                'options' => [
                    ['text' => 'Helium', 'correct' => true],
                    ['text' => 'Neon', 'correct' => true],
                    ['text' => 'Oxygen', 'correct' => false],
                    ['text' => 'Argon', 'correct' => true],
                ],
            ],
            [
                'order' => 5,
                'type' => 'short_answer',
                'text' => 'What is the chemical symbol for Gold?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Au comes from the Latin word "Aurum", meaning shining dawn!',
                'options' => [
                    ['text' => 'Au', 'correct' => true],
                    ['text' => 'AU', 'correct' => true],
                    ['text' => 'au', 'correct' => true],
                ],
            ],
            [
                'order' => 6,
                'type' => 'multiple_choice',
                'text' => 'How many hearts does an octopus have?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'An octopus has 3 hearts! Two pump blood to the gills, while a larger central heart circulates blood to the rest of the body.',
                'options' => [
                    ['text' => '1', 'correct' => false],
                    ['text' => '2', 'correct' => false],
                    ['text' => '3', 'correct' => true],
                    ['text' => '4', 'correct' => false],
                ],
            ],
            [
                'order' => 7,
                'type' => 'true_false',
                'text' => 'Sound travels faster in water than in air.',
                'time_limit' => 15,
                'points' => 100,
                'explanation' => 'True! Sound travels about 4.3 times faster in water (approx 1,480 m/s) because water particles are packed much closer together than air.',
                'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ],
            ],
            [
                'order' => 8,
                'type' => 'multiple_choice',
                'text' => 'Which is the fastest land animal on planet Earth?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'The cheetah can reach burst speeds up to 110-120 km/h (70-75 mph)!',
                'options' => [
                    ['text' => 'Lion', 'correct' => false],
                    ['text' => 'Cheetah', 'correct' => true],
                    ['text' => 'Pronghorn Antelope', 'correct' => false],
                    ['text' => 'Ostrich', 'correct' => false],
                ],
            ],
            [
                'order' => 9,
                'type' => 'multiple_select',
                'text' => 'Which of the following countries are in Africa? (Select all that apply)',
                'time_limit' => 25,
                'points' => 150,
                'explanation' => 'Kenya, Egypt, and Nigeria are in Africa. Peru is in South America.',
                'options' => [
                    ['text' => 'Kenya', 'correct' => true],
                    ['text' => 'Peru', 'correct' => false],
                    ['text' => 'Nigeria', 'correct' => true],
                    ['text' => 'Egypt', 'correct' => true],
                ],
            ],
            [
                'order' => 10,
                'type' => 'multiple_choice',
                'text' => 'What is the powerhouse of the biological cell?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Mitochondria generate most of the chemical energy needed to power the cell’s biochemical reactions (ATP).',
                'options' => [
                    ['text' => 'Nucleus', 'correct' => false],
                    ['text' => 'Ribosome', 'correct' => false],
                    ['text' => 'Mitochondria', 'correct' => true],
                    ['text' => 'Endoplasmic Reticulum', 'correct' => false],
                ],
            ],
        ];

        foreach ($questions as $qData) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'type' => $qData['type'],
                'question_text' => $qData['text'],
                'time_limit' => $qData['time_limit'],
                'points' => $qData['points'],
                'order' => $qData['order'],
                'explanation' => $qData['explanation'],
            ]);

            foreach ($qData['options'] as $idx => $opt) {
                AnswerOption::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['text'],
                    'is_correct' => $opt['correct'],
                    'order' => $idx + 1,
                ]);
            }
        }
    }
}
