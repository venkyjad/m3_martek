import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Users, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Brief Collection',
      description: 'Progressive form that captures all essential campaign requirements'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Campaign Plans',
      description: 'Generate comprehensive strategies tailored to your objectives'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Creative Talent Matching',
      description: 'Find the perfect creatives for your campaign requirements'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Optimization',
      description: 'Track and optimize campaign performance in real-time'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Create Winning
              <span className="text-primary-400 block">Marketing Campaigns</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              From brief to execution - our AI-powered platform helps you create, plan, and execute 
              marketing campaigns that drive real results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/brief/new">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Marketing Brief
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Demo Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Streamline your entire campaign workflow from planning to execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple 4-step process to launch your campaign
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Brief',
                description: 'Fill out our progressive form with your campaign objectives and requirements'
              },
              {
                step: '02',
                title: 'AI Generation',
                description: 'Our AI analyzes your brief and generates a comprehensive campaign plan'
              },
              {
                step: '03',
                title: 'Find Creatives',
                description: 'Match with creative professionals who fit your campaign needs perfectly'
              },
              {
                step: '04',
                title: 'Execute & Optimize',
                description: 'Launch your campaign and track performance with real-time optimization'
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {step.description}
                </p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-primary-500 to-transparent -translate-x-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Create Your First Campaign?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of marketers who are already using M3 Slice to create winning campaigns
          </p>
          
          <Link to="/brief/new">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

