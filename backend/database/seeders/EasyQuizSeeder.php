<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\AnswerOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EasyQuizSeeder extends Seeder
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
            ['slug' => 'fun-trivia-blitz-easy'],
            [
                'title' => 'Fun Trivia Blitz (Easy Mode)',
                'description' => 'A super fun, 10-question easy general knowledge quiz featuring animals, science, geography, and pop culture!',
                'category' => 'General Knowledge',
                'difficulty' => 'easy',
                'cover_image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
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

        // Remove old questions if re-seeding to keep exact 10 questions
        $quiz->questions()->delete();

        $questionsData = [
            [
                'order' => 1,
                'type' => 'multiple_choice',
                'text' => 'What is the largest ocean on planet Earth?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 30% of the surface!',
                'options' => [
                    ['text' => 'Atlantic Ocean', 'correct' => false],
                    ['text' => 'Indian Ocean', 'correct' => false],
                    ['text' => 'Pacific Ocean', 'correct' => true],
                    ['text' => 'Arctic Ocean', 'correct' => false],
                ],
            ],
            [
                'order' => 2,
                'type' => 'true_false',
                'text' => 'The human heart has four chambers.',
                'time_limit' => 15,
                'points' => 100,
                'explanation' => 'The human heart consists of four chambers: the right atrium, left atrium, right ventricle, and left ventricle.',
                'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ],
            ],
            [
                'order' => 3,
                'type' => 'multiple_choice',
                'text' => 'Which color is made by mixing Blue and Yellow paint?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Combining primary colors blue and yellow produces the secondary color green!',
                'options' => [
                    ['text' => 'Purple', 'correct' => false],
                    ['text' => 'Green', 'correct' => true],
                    ['text' => 'Orange', 'correct' => false],
                    ['text' => 'Brown', 'correct' => false],
                ],
            ],
            [
                'order' => 4,
                'type' => 'multiple_choice',
                'text' => 'How many days are there in a standard leap year?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'A leap year contains 366 days thanks to the addition of February 29th!',
                'options' => [
                    ['text' => '364', 'correct' => false],
                    ['text' => '365', 'correct' => false],
                    ['text' => '366', 'correct' => true],
                    ['text' => '367', 'correct' => false],
                ],
            ],
            [
                'order' => 5,
                'type' => 'multiple_select',
                'text' => 'Which of the following animals are mammals? (Select all that apply)',
                'time_limit' => 25,
                'points' => 150,
                'explanation' => 'Dolphins, elephants, and dogs are mammals that breathe air and give birth to live young. Eagles are birds.',
                'options' => [
                    ['text' => 'Dolphin', 'correct' => true],
                    ['text' => 'Elephant', 'correct' => true],
                    ['text' => 'Eagle', 'correct' => false],
                    ['text' => 'Dog', 'correct' => true],
                ],
            ],
            [
                'order' => 6,
                'type' => 'true_false',
                'text' => 'Bananas grow on woody trees.',
                'time_limit' => 15,
                'points' => 100,
                'explanation' => 'False! Banana plants are actually giant perennial herbs, not woody trees.',
                'options' => [
                    ['text' => 'True', 'correct' => false],
                    ['text' => 'False', 'correct' => true],
                ],
            ],
            [
                'order' => 7,
                'type' => 'multiple_choice',
                'text' => 'What is the name of the famous fairy in Peter Pan?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'Tinker Bell is the iconic pixie and loyal companion of Peter Pan.',
                'options' => [
                    ['text' => 'Cinderella', 'correct' => false],
                    ['text' => 'Tinker Bell', 'correct' => true],
                    ['text' => 'Wendy', 'correct' => false],
                    ['text' => 'Belle', 'correct' => false],
                ],
            ],
            [
                'order' => 8,
                'type' => 'multiple_choice',
                'text' => 'Which musical instrument typically has 88 black and white keys?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'A standard modern acoustic piano features exactly 88 keys: 52 white and 36 black.',
                'options' => [
                    ['text' => 'Guitar', 'correct' => false],
                    ['text' => 'Violin', 'correct' => false],
                    ['text' => 'Piano', 'correct' => true],
                    ['text' => 'Flute', 'correct' => false],
                ],
            ],
            [
                'order' => 9,
                'type' => 'multiple_choice',
                'text' => 'What is the boiling point of pure water at sea level in Celsius?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'At sea level atmospheric pressure, pure water boils at precisely 100°C (212°F).',
                'options' => [
                    ['text' => '50°C', 'correct' => false],
                    ['text' => '90°C', 'correct' => false],
                    ['text' => '100°C', 'correct' => true],
                    ['text' => '150°C', 'correct' => false],
                ],
            ],
            [
                'order' => 10,
                'type' => 'multiple_choice',
                'text' => 'Which continent is home to the Sahara Desert?',
                'time_limit' => 20,
                'points' => 100,
                'explanation' => 'The Sahara Desert spans across Northern Africa and is the largest hot desert on Earth!',
                'options' => [
                    ['text' => 'Asia', 'correct' => false],
                    ['text' => 'South America', 'correct' => false],
                    ['text' => 'Africa', 'correct' => true],
                    ['text' => 'Australia', 'correct' => false],
                ],
            ],
        ];

        foreach ($questionsData as $qData) {
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
